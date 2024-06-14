import express from "express";
import {
  changeSystemGeneratedPassword,
  doctorLogin,
  registerDoctor,
} from "../controllers/doctor.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const doctorRoute = express.Router();

doctorRoute.post("/doctor/create", adminMiddleware, registerDoctor);
doctorRoute.post("/doctor/login", doctorLogin);
doctorRoute.patch(
  "/doctor/reset-sys-generated-password",
  changeSystemGeneratedPassword
);

export default doctorRoute;
