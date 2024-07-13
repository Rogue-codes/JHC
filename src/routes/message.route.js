import express from 'express';
import { getMessages, getSidebarUsers, sendMessage } from '../controllers/message.controller.js';
import { reservationMiddleware } from '../middlewares/reservation.middleware.js';
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const messageRoute = express.Router();

messageRoute.post('/message/send/:id', 
reservationMiddleware, sendMessage);

messageRoute.get("/message/:id", reservationMiddleware, getMessages);

messageRoute.get("/messages", adminMiddleware, getSidebarUsers);

export default messageRoute;