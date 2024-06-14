import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import hospitalRoute from "./src/routes/hospital.route.js";
import patientRoute from "./src/routes/patient.route.js";
import doctorRoute from "./src/routes/doctor.route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const PORT = process.env.PORT;

app.use("/api/v1/JHC-hms", hospitalRoute);
app.use("/api/v1/JHC-hms", patientRoute);
app.use("/api/v1/JHC-hms", doctorRoute);

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
