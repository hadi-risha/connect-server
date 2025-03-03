"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const config_1 = __importDefault(require("../config/config"));
const userRepoService_1 = require("../services/userRepoService");
const userService = new userRepoService_1.UserService();
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = req.header("Authorization");
        if (!token) {
            return res.status(httpStatusCodes_1.HttpStatus.UNAUTHORIZED).json({ message: 'access denied, no token provided' });
        }
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }
        const secret = config_1.default.jwtSecret;
        if (!secret) {
            return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'JWT secret is not defined in env' });
        }
        //verify the token using the secret
        const verified = jsonwebtoken_1.default.verify(token, secret);
        req.userData = verified;
        next();
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
        }
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "an unknown error occurred" });
    }
});
exports.verifyToken = verifyToken;
