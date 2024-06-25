import mongoose from "mongoose";

const reservationActivityLogSchema = new mongoose.Schema({
  activity: {
    type: String,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
  },
});

const ReservationActivityLogModel = mongoose.model(
  "ReservationActivityLog",
  reservationActivityLogSchema
);

export default ReservationActivityLogModel;
