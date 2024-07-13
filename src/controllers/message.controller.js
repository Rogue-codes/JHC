import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";
import PatientModel from "../models/patient.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;

    const senderId = req.user._id.toString();

    let conversation = await ConversationModel.findOne({
      participants: { $all: [receiverId, senderId] },
    });
    console.log("a");

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, receiverId],
      });
    }
    console.log("b");

    const newMessage = await MessageModel.create({
      message: req.body.message,
      receiverId,
      senderId,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
      await conversation.save();

      // SOCKET IO FUNCTIONALITY WILL GO HERE
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        // io.to(<socket_id>).emit() used to send events to specific client
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: newMessage,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id.toString();

    const conversation = await ConversationModel.findOne({
      participants: { $all: [receiverId, senderId] },
    }).populate("messages").select("-__v");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        message: "No Conversation Created yet",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: conversation.messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSidebarUsers = async (req, res) => {
  try {
    const conversations = await ConversationModel.find();

    if (!conversations || conversations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No conversations found",
      });
    }

    const patientsPromises = conversations.map(async (conversation) => {
      const patientId = conversation.participants[1]; 
      const patient = await PatientModel.findById(patientId);
      return patient; 
    });

    const patients = await Promise.all(patientsPromises);

    res.status(200).json({
      success: true,
      message: "Conversations retrieved successfully",
      data: patients,
    });
  } catch (error) {
    console.error("Error retrieving conversations:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ObjectId in conversations",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving conversations",
      error: error.message,
    });
  }
};