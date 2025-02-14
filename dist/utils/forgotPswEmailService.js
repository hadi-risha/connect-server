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
exports.sendForgotPasswordEmail = void 0;
exports.generateResetPasswordToken = generateResetPasswordToken;
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
/* RESET PSW TOKEN */
function generateResetPasswordToken() {
    return crypto_1.default.randomBytes(32).toString("hex");
}
/* SEND FORGOT PSW EMAIL */
const sendForgotPasswordEmail = (email, resetUrl) => __awaiter(void 0, void 0, void 0, function* () {
    let transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');
    }
    catch (error) {
        console.error('error sending forgot-psw email:', error);
        throw new Error('could not send forgot-psw reset email');
    }
});
exports.sendForgotPasswordEmail = sendForgotPasswordEmail;
