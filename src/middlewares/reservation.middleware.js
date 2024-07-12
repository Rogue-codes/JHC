import jwt from "jsonwebtoken";
import HospitalModel from "../models/hospital.model.js";
import PatientModel from "../models/patient.model.js";

export const reservationMiddleware = async (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: token not found",
      });
    }

    const token = authHeaders.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: token not found",
      });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const adminOrPatient =
      (await HospitalModel.findById(decodedToken.id)) ||
      (await PatientModel.findById(decodedToken.id));

    if (!adminOrPatient) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you don't have rights to perform this action",
      });
    }

    req.user = adminOrPatient;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
