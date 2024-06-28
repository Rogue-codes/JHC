import ActivityLogModel from "../models/activityLog.model.js";
import PatientActivityLogModel from "../models/patient.activity.model.js";
import ReservationActivityLogModel from "../models/reservation.activity.model.js";
import { format } from "date-fns";

export const activityLogMiddleware = async (initiator, action, target) => {
  try {
    const activity = `${initiator} initiated the ${action} of ${target.first_name} ${target.last_name}`;
    const timestamp = new Date().toLocaleString();

    const log = await ActivityLogModel.create({
      activity,
      Date: timestamp,
      doctorId: target._id,
    });

    console.log(log);
  } catch (error) {
    console.log(error);
  }
};

export const patientActivityLogMiddleware = async (action, target) => {
  try {
    const activity = `${action} of ${target.first_name} ${target.last_name}`;
    const timestamp = new Date().toLocaleString();

    const log = await PatientActivityLogModel.create({
      activity,
      Date: timestamp,
      patientId: target._id,
    });

    console.log(log);
  } catch (error) {
    console.log(error);
  }
};

export const reservationActivityLogMiddleware = async (
  initiator,
  action,
  patient,
  doctor,
  time,
  id,
  oldTime
) => {
  try {
    // Format the time using date-fns
    const formattedTime = format(new Date(time), "PPPP p");
    const formattedOldTime = format(new Date(oldTime), "PPPP p");

    console.log("formattedOldTime", formattedOldTime);

    let activity;
    if (initiator === "Admin") {
      if (action === "RESCHEDULED") {
        activity = `${initiator} ${action} an appointment for ${patient.first_name} ${patient.last_name} with ${doctor.first_name} ${doctor.last_name} from ${formattedOldTime} to ${formattedTime}`;
      } else {
        activity = `${initiator} ${action} an appointment for ${patient.first_name} ${patient.last_name} with ${doctor.first_name} ${doctor.last_name} at ${formattedTime}`;
      }
    } else {
      activity = `${patient.first_name} ${patient.last_name} ${action} an appointment with ${doctor.first_name} ${doctor.last_name} at ${formattedTime}`;
    }

    const timestamp = new Date().toLocaleString();
    const log = await ReservationActivityLogModel.create({
      activity,
      Date: timestamp,
      reservationId: id,
    });

    console.log(log);
  } catch (error) {
    console.log(error);
  }
};
