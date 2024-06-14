import express from "express";
import { createHospital, loginAdmin } from "../controllers/hospital.controller.js";

const hospitalRoute = express.Router();

hospitalRoute.post("/hospital/create", createHospital);
hospitalRoute.post("/hospital/login", loginAdmin);

export default hospitalRoute;
