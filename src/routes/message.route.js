import express from 'express';
import { sendMessage } from '../controllers/message.controller.js';
import { reservationMiddleware } from '../middlewares/reservation.middleware.js';

const messageRoute = express.Router();

messageRoute.post('/message/send/:id', 
reservationMiddleware, sendMessage);

export default messageRoute;