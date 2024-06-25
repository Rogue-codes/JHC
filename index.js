import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import hospitalRoute from "./src/routes/hospital.route.js";
import patientRoute from "./src/routes/patient.route.js";
import doctorRoute from "./src/routes/doctor.route.js";
import { v2 as cloudinary } from "cloudinary";
import reservationRoute from "./src/routes/reservation.route.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT;

app.use("/api/v1/JHC-hms", hospitalRoute);
app.use("/api/v1/JHC-hms", patientRoute);
app.use("/api/v1/JHC-hms", doctorRoute);
app.use("/api/v1/JHC-hms", reservationRoute);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});

app.post("/", (req, res) => {
  return res.send("Welcome to JHC Hospital management software");
});

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error(err));
