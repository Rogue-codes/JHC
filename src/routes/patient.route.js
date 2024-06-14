import express from "express";
import { forgotPassword, patientLogin, registerPatient, resetPassword, verifyAccount } from "../controllers/patient.controller.js";

const patientRoute = express.Router();

patientRoute.post("/patient/create", registerPatient);
patientRoute.post("/patient/verify-account", verifyAccount);
patientRoute.post("/patient/forgot-password", forgotPassword);
patientRoute.post("/patient/reset-password", resetPassword);
patientRoute.post("/patient/login", patientLogin);

export default patientRoute;
