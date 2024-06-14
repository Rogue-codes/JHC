import jwt from "jsonwebtoken";
import HospitalModel from "../models/hospital.model.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized token not found",
      });
    }

    const token = authHeaders.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized token not found",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await HospitalModel.findById(decodedToken.id);

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "forbidden: you don't have rights to perform this action...",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "invalid token",
    });
  }
};
