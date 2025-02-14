"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.generateOtp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const otpStore = {};
console.log("otpStore", otpStore);
const generateOtp = (email) => {
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    otpStore[email] = otp;
    setTimeout(() => delete otpStore[email], 2 * 60 * 1000); //expires after 2 minutes
    return otp;
};
exports.generateOtp = generateOtp;
const verifyOtp = (email, otp) => {
    if (otpStore[email] === otp) {
        delete otpStore[email];
        return true;
    }
    return false;
};
exports.verifyOtp = verifyOtp;
