import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    ],
    messages: [
      {
        participantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
          default: [],
        },
        participantType: {
          type: String,
          enum: ["Admin", "Doctor", "Patient"],
          required: true,
        },
      },
    ]
  },
  {
    timestamps: true,
  }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);

export default ConversationModel;
