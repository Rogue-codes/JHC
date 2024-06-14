import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const genToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};
