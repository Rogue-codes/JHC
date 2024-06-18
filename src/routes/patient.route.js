import express from "express";
import { forgotPassword, getAllPatients, getPatientActivityLogs, getPatientById, patientLogin, registerPatient, resetPassword, verifyAccount } from "../controllers/patient.controller.js";
import { uploadImg } from "../middlewares/uploadimage.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const patientRoute = express.Router();

patientRoute.post("/patient/create", uploadImg.single('patient_img'), registerPatient);
patientRoute.post("/patient/verify-account", verifyAccount);
patientRoute.post("/patient/forgot-password", forgotPassword);
patientRoute.post("/patient/reset-password", resetPassword);
patientRoute.post("/patient/login", patientLogin);
patientRoute.get("/patients/all", getAllPatients);
patientRoute.get("/patient/:id", getPatientById);
patientRoute.get("/patient/logs/:id", adminMiddleware, getPatientActivityLogs);

export default patientRoute;
