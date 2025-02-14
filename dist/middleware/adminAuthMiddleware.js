"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = void 0;
const adminTokenService_1 = require("../utils/adminTokenService");
const dotenv_1 = __importDefault(require("dotenv"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
dotenv_1.default.config();
const adminAuthMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(httpStatusCodes_1.HttpStatus.UNAUTHORIZED).json({ message: 'No token provided. Unauthorized access!' });
        return;
    }
    try {
        // Verify token
        const decoded = (0, adminTokenService_1.adminVerifyToken)(token);
        req.adminId = decoded.id;
        next();
    }
    catch (error) {
        res.status(httpStatusCodes_1.HttpStatus.UNAUTHORIZED).json({ message: 'Token is not valid' });
    }
};
exports.adminAuthMiddleware = adminAuthMiddleware;
