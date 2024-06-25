import express from "express";
import {
  createReservation,
  geReservationActivityLogs,
  getAllReservations,
  getReservationById,
} from "../controllers/reservation.controller.js";
import { reservationMiddleware } from "../middlewares/resrvation.middleware.js";

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

export default reservationRoute;
