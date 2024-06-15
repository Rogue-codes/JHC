import express from "express";
import {
  changeSystemGeneratedPassword,
  doctorLogin,
  getDoctors,
  registerDoctor,
  validateDoctorEmailAndPhone,
} from "../controllers/doctor.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const doctorRoute = express.Router();

doctorRoute.post("/doctor/create", adminMiddleware, registerDoctor);
doctorRoute.post("/doctor/login", doctorLogin);
doctorRoute.patch(
  "/doctor/reset-sys-generated-password",
  changeSystemGeneratedPassword
);
doctorRoute.get("/doctors/all", adminMiddleware, getDoctors);
doctorRoute.post("/doctor/validate", adminMiddleware, validateDoctorEmailAndPhone);

export default doctorRoute;
