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
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
});

const ActivityLogModel = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLogModel;
