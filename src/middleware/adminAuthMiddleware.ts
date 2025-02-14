import { Request, Response, NextFunction } from "express";
import { adminVerifyToken } from "../utils/adminTokenService";
import dotenv from 'dotenv';
import { HttpStatus } from "../utils/httpStatusCodes";

dotenv.config();

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No token provided. Unauthorized access!' });
        return;
    }
  
    try {
        // Verify token
        const decoded = adminVerifyToken(token) as { id: string }; 
        (req as any).adminId = decoded.id;
        
        next();
    } catch (error) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token is not valid' });
    }
};
