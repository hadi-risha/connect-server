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
exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config/config"));
const sendOtpEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("sendOtpEmail section");
    let transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: config_1.default.emailUser,
            pass: config_1.default.emailPass,
        }
    });
    let mailOptions = {
        from: config_1.default.emailUser,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    }
    catch (error) {
        console.error('error sending OTP email:', error);
        throw new Error('could not send OTP email');
    }
});
exports.sendOtpEmail = sendOtpEmail;
