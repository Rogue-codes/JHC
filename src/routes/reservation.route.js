import express from "express";
import {
  cancelReservation,
  createReservation,
  geReservationActivityLogs,
  getAllReservations,
  getReservationById,
  rescheduleReservation,
} from "../controllers/reservation.controller.js";
import { reservationMiddleware } from "../middlewares/reservation.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const reservationRoute = express.Router();

reservationRoute.post(
  "/reservation/create",
  reservationMiddleware,
  createReservation
);
reservationRoute.get(
  "/reservation/logs/:id",
  reservationMiddleware,
  geReservationActivityLogs
);
reservationRoute.get(
  "/reservations/all",
  reservationMiddleware,
  getAllReservations
);
reservationRoute.get(
  "/reservation/:id",
  reservationMiddleware,
  getReservationById
);
reservationRoute.put(
  "/reservation/reschedule/:id",
  reservationMiddleware,
  rescheduleReservation
);
reservationRoute.patch(
  "/reservation/reject/:id",
  adminMiddleware,
  cancelReservation
);

export default reservationRoute;
