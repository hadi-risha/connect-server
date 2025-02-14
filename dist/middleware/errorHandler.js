"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(err.message || 'Internal Server Error');
    res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred. Please try again later.' });
};
exports.default = errorHandler;
