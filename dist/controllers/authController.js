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
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs")); //*
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); //*
const userRepoService_1 = require("../services/userRepoService"); //*
const httpStatusCodes_1 = require("../utils/httpStatusCodes"); //*
const otpService_1 = require("../utils/otpService"); //*
const otpEmailService_1 = require("../utils/otpEmailService"); //*
const forgotPswService_1 = require("../utils/forgotPswService"); //*
const config_1 = __importDefault(require("../config/config")); //*
class AuthController {
    constructor() {
        this.userService = new userRepoService_1.UserService();
    }
    /* SIGNUP */
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password, confirmPassword } = req.body;
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'All fields are required' });
            }
            if (password !== confirmPassword) {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Passwords do not match' });
            }
            const passwordPattern = /^.{8,}$/;
            if (!passwordPattern.test(password)) {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Password must be at least 8 characters long.' });
            }
            try {
                const existingUser = yield this.userService.findUserByEmail(email);
                if (existingUser) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'User already exists' });
                }
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                const user = yield this.userService.createUser({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    role: 'student',
                    isVerified: false,
                    isBlocked: false,
                    isRoleChanged: false,
                });
                const otp = (0, otpService_1.generateOtp)(email);
                yield (0, otpEmailService_1.sendOtpEmail)(email, otp);
                console.log("otp mail sended", otp);
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'Signup successful, please verify your OTP' });
            }
            catch (error) {
                console.error(error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error signing up', error: error.message });
            }
        });
    }
    /* VERIFY OTP */
    verifyUserOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, otp } = req.body;
            try {
                if ((0, otpService_1.verifyOtp)(email, otp)) {
                    const updatedUser = yield this.userService.updateUserVerification(email);
                    const existingUser = yield this.userService.findUserByEmail(email);
                    if (!existingUser) {
                        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'user doesnt exists' });
                    }
                    const token = jsonwebtoken_1.default.sign({ id: existingUser._id, role: existingUser.role, isBlocked: existingUser.isBlocked, isRoleChanged: existingUser.isRoleChanged, userDetails: req.userData }, config_1.default.jwtSecret);
                    const userWithoutPassword = existingUser.toObject();
                    delete userWithoutPassword.password;
                    console.log("token, userData without password", token, userWithoutPassword);
                    return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'OTP verified successfully', user: updatedUser, token, userData: userWithoutPassword });
                }
                else {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'The OTP is not valid. Please re-enter it.' });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error verifying OTP', error: error.message });
            }
        });
    }
    /* VERIFY ACCOUNT IN LOGIN */
    verifyNow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const existingUser = yield this.userService.findUserByEmail(email);
                if (!existingUser) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'user doesnt exists' });
                }
                const otp = (0, otpService_1.generateOtp)(email);
                yield (0, otpEmailService_1.sendOtpEmail)(email, otp);
                console.log("user login verify, otp mail sended", otp);
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'verify now, otp send to email,please verify your OTP' });
            }
            catch (error) {
                console.log("error in login verification");
                console.error(error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error in login verification', error: error.message });
            }
        });
    }
    ;
    /* RESEND OTP */
    resendOTP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const existingUser = yield this.userService.findUserByEmail(email);
                if (!existingUser) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'user does not exist' });
                }
                if (existingUser.isVerified) {
                    return res.status(httpStatusCodes_1.HttpStatus.CONFLICT).json({ message: 'user is already verified' });
                }
                //generate OTP and send email
                const otp = (0, otpService_1.generateOtp)(email);
                yield (0, otpEmailService_1.sendOtpEmail)(email, otp);
                console.log("resend OTP email sent successfully", otp);
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'OTP resent successfully, please verify your OTP.' });
            }
            catch (error) {
                console.error('error in resending OTP:', error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error in resending OTP', error: error.message });
            }
        });
    }
    ;
    /* LOGGING IN */
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const existingUser = yield this.userService.findUserByEmail(email);
                if (!existingUser) {
                    console.log("User doesn't exist. Please recheck your email.");
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "User doesn't exist. Please recheck your email." });
                }
                if (!existingUser.password) {
                    console.log("Password not set for user, cannot log in.");
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Password not set for this user." });
                }
                const isMatch = yield bcryptjs_1.default.compare(password, existingUser.password);
                if (!isMatch) {
                    console.log("invalid password");
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "invalid credentials." });
                }
                if (!existingUser.isVerified) {
                    console.log("user didn't verify, please verify to login");
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Please verify your email to log in.", needsVerification: true });
                }
                const token = jsonwebtoken_1.default.sign({ id: existingUser._id, role: existingUser.role, isBlocked: existingUser.isBlocked, isRoleChanged: existingUser.isRoleChanged, userDetails: req.userData }, config_1.default.jwtSecret);
                const userWithoutPassword = existingUser.toObject();
                delete userWithoutPassword.password;
                let homePageUrl = '';
                if (existingUser.role === 'student') {
                    homePageUrl = '/student/home';
                }
                else if (existingUser.role === 'instructor') {
                    homePageUrl = '/instructor/home';
                }
                console.log("redirect to -->", homePageUrl);
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'login successful', token, role: existingUser.role, userData: userWithoutPassword });
            }
            catch (error) {
                console.error(error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
            }
        });
    }
    ;
    /* LOG OUT */
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (token) {
                res.clearCookie("token");
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Logout successful" });
            }
            else {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "No token found, cannot log out" });
            }
        });
    }
    ;
    /* REQUEST RESET PSW  */
    requestPasswordReset(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const user = yield this.userService.findUserByEmail(email);
                if (!user) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'Oops! That email isn’t registered with us.' });
                }
                const resetToken = (0, forgotPswService_1.generateResetPasswordToken)();
                console.log("pasw reset token :- ", resetToken);
                user.resetPasswordToken = resetToken;
                // user.resetPasswordExpiry = new Date(Date.now() + 300000);   //expire after 5 minutes
                user.resetPasswordExpiry = new Date(Date.now() + 600000); //  10 minutes
                yield user.save();
                const resetUrl = `${config_1.default.frontendUrl}/reset-password?token=${resetToken}`; //frontend url
                yield (0, forgotPswService_1.sendForgotPasswordEmail)(email, resetUrl);
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Password reset email sent! Please check your email for the reset link.", resetToken });
            }
            catch (error) {
                console.error(error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error in forgot-psw ' });
            }
        });
    }
    ;
    /* RESET PSW  */
    resetUserPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.params;
            const { password, confirmPassword } = req.body;
            if (!password || !confirmPassword) {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'All fields are required' });
            }
            if (password !== confirmPassword) {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Passwords do not match' });
            }
            try {
                const user = yield this.userService.findUserByResetToken(token);
                if (!user) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Invalid or expired token" });
                }
                if (user === null) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "invalid reset link" });
                }
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
                user.password = hashedPassword;
                user.resetPasswordToken = null;
                user.resetPasswordExpiry = null;
                yield user.save();
                res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'Password reset successful' });
            }
            catch (error) {
                console.log("error in reset user password");
                console.error(error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
            }
        });
    }
    ;
}
exports.AuthController = AuthController;
