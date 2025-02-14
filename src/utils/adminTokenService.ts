import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const generateToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1h" });
};

export const adminVerifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
