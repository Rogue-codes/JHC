import { validateReservation } from "../services/validator.js";
import DoctorModel from "./models/doctor.model.js";
import ReservationModel from "./models/reservation.model.js";
import dotenv from "dotenv";
dotenv.config();

export const createReservation = async (req, res) => {
  try {
    const { error } = validateReservation(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { time, date, patient, doctor } = req.body;

    const reservationDateTime = new Date(`${date}T${time}`);
    const currentDateTime = new Date();
    const minReservationTime = new Date(currentDateTime.getTime() + 30 * 60000);

    if (reservationDateTime < minReservationTime) {
      return res.status(400).json({
        success: false,
        message:
          "Reservation time must be at least 30 minutes ahead of the current time",
      });
    }

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
        message: "Doctor not active",
      });
    }

    // Check if a reservation exists for that doctor at the same time
    const existingReservation = await ReservationModel.findOne({
      doctor,
      date,
      time,
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: "Doctor already has an appointment at this time",
      });
    }

    const fee = doctorObject.is_consultant
      ? parseInt(process.env.FEE) * parseInt(process.env.CONSULTANT_RATE)
      : parseInt(process.env.FEE);

    const newReservation = await ReservationModel.create({
      time,
      date,
      patient,
      doctor,
      fee,
    });

    res.status(201).json({
      success: true,
      message:
        "Reservation created, a mail will be sent to you with full details about the reservation",
      reservation: newReservation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
