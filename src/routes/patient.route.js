import express from "express";
import {
  forgotPassword,
  getAllPatients,
  getPatientActivityLogs,
  getPatientById,
  modifyPatient,
  patientLogin,
  registerPatient,
  resetPassword,
  searchPatients,
  validatePatientEmailAndPhone,
  verifyAccount,
} from "../controllers/patient.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const patientRoute = express.Router();

patientRoute.post("/patient/create", registerPatient);
patientRoute.post("/patient/verify-account", verifyAccount);
patientRoute.post("/patient/forgot-password", forgotPassword);
patientRoute.post("/patient/reset-password", resetPassword);
patientRoute.post("/patient/login", patientLogin);
patientRoute.get("/patients/all", getAllPatients);
patientRoute.get("/patient/:id", getPatientById);
patientRoute.get("/patient/logs/:id", adminMiddleware, getPatientActivityLogs);
patientRoute.post(
  "/patient/validate",
  adminMiddleware,
  validatePatientEmailAndPhone
);
patientRoute.put("/patient/update/:id", adminMiddleware, modifyPatient);
patientRoute.get("/patient", adminMiddleware, searchPatients);

export default patientRoute;
