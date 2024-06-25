import { validateReservation } from "../services/validator.js";
import DoctorModel from "../models/doctor.model.js";
import ReservationModel from "../models/reservation.model.js";
import dotenv from "dotenv";
import { reservationActivityLogMiddleware } from "../middlewares/logs.js";
import ReservationActivityLogModel from "../models/reservation.activity.model.js";
dotenv.config();

export const createReservation = async (req, res) => {
  try {
    // Validate the reservation data
    const { error } = validateReservation(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { time, patient, doctor } = req.body;

    // Check reservation time is at least 30 minutes ahead
    const reservationDateTime = new Date(time);
    const currentDateTime = new Date();
    const minReservationTime = new Date(currentDateTime.getTime() + 30 * 60000);

    if (reservationDateTime < minReservationTime) {
      return res.status(400).json({
        success: false,
        message:
          "Reservation time must be at least 30 minutes ahead of the current time",
      });
    }

    // Validate that the reservation date is not in the past
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const reservationDate = new Date(time).setHours(0, 0, 0, 0);

    if (reservationDate < currentDate) {
      return res.status(400).json({
        success: false,
        message: "Reservation date cannot be in the past",
      });
    }

    // Find the doctor and check if active
    const doctorObject = await DoctorModel.findById(doctor);
    if (!doctorObject) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctorObject.is_active) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not active",
      });
    }

    // Check if a reservation already exists for the doctor at the same time
    const existingReservation = await ReservationModel.findOne({
      doctor,
      time,
    });
    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: "Doctor already has an appointment at this time",
      });
    }

    // Calculate the fee based on doctor type
    const baseFee = parseInt(process.env.FEE);
    const consultantRate = doctorObject.is_consultant
      ? parseInt(process.env.CONSULTANT_RATE)
      : 1;
    const fee = baseFee * consultantRate;

    // Create a new reservation
    const newReservation = await ReservationModel.create({
      time,
      patient,
      doctor,
      fee,
    });

    // Populate doctor and patient details
    const populatedReservation = await ReservationModel.findById(
      newReservation._id
    )
      .populate("doctor")
      .populate("patient");

    // Log the reservation activity
    const user = req.user.username === "JHC-Admin" ? "Admin" : "Patient";
    reservationActivityLogMiddleware(
      user,
      "CREATED",
      populatedReservation.patient,
      populatedReservation.doctor,
      populatedReservation.time,
      populatedReservation._id
    );

    // Send response with reservation details
    res.status(201).json({
      success: true,
      message:
        "Reservation created successfully. A mail will be sent to you with full details about the reservation.",
      reservation: populatedReservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while creating the reservation. Please try again later.",
    });
  }
};

export const geReservationActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "reservation id not found",
      });
    }

    const log = await ReservationActivityLogModel.find({ reservationId: id });
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "reservation activity logs retrieved successfully",
      data: log,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    let query = ReservationModel.find();
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query = query.find({
        $or: [
          { first_name: searchRegex },
          { last_name: searchRegex },
          { patient_id: searchRegex },
        ],
      });
    }

    if (req.query.sort) {
      const sortField = req.query.sort;
      query = query.sort(sortField);
    } else {
      query = query.sort("-createdAt");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);

    const reservationsCount = await ReservationModel.countDocuments(
      query.getQuery()
    );
    const last_page = Math.ceil(reservationsCount / limit);

    if (page > last_page && last_page > 0) {
      throw new Error("This page does not exist");
    }

    const allReservations = await query
      .populate("doctor", "first_name last_name")
      .populate("patient", "first_name last_name DOB");

    if (!allReservations.length) {
      return res.status(200).json({
        status: "success",
        message: "No reservation found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "All reservations retrieved successfully",
      data: allReservations,
      meta: {
        per_page: limit,
        current_page: page,
        last_page: last_page,
        total: reservationsCount,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "reservation id not found",
      });
    }

    const reservation = await ReservationModel.findById(id)
      .populate("patient", "first_name last_name")
      .populate("doctor", "first_name last_name");
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "reservation retrieved successfully",
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
