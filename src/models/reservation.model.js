import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    reservation_status: {
      type: String,
      enum: ["pending", "ongoing", "completed"],
      default: "pending",
    },
    fee_status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

const ReservationModel = mongoose.model("Reservation", reservationSchema);

export default ReservationModel;
