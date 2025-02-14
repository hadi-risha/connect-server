
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { HttpStatus } from '../utils/httpStatusCodes';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message || 'Internal Server Error');

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred. Please try again later.' });
};

export default errorHandler;
