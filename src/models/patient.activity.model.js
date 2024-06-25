import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
});

const PatientActivityLogModel = mongoose.model("PatientActivityLog", activityLogSchema);

export default PatientActivityLogModel;
