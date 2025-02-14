import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatus } from '../utils/httpStatusCodes';
import config from '../config/config';
import { UserService } from '../services/userRepoService';

const userService = new UserService();

/* COMMON AUTH MIDDLEWARE */
declare module 'express-serve-static-core' {
  interface Request {
    userData?: string | jwt.JwtPayload;
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        let token = req.header("Authorization"); 
        if (!token) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'access denied, no token provided' });
        }
        if (token.startsWith("Bearer ")) {  
            token = token.slice(7, token.length).trimLeft();
        }

        const secret = config.jwtSecret;
        if (!secret) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'JWT secret is not defined in env' });
        }

        //verify the token using the secret
        const verified = jwt.verify(token, secret);
        req.userData = verified;  
        
        next(); 
    } catch (err) {
        if (err instanceof Error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
        }
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "an unknown error occurred" });
    }
};



