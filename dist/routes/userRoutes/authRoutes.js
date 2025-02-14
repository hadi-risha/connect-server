"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../../controllers/authController");
const asyncHandler_1 = __importDefault(require("../../middleware/asyncHandler"));
const checkUserRole_1 = require("../../middleware/checkUserRole");
const verifyUserToken_1 = require("../../middleware/verifyUserToken");
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("../../config/config"));
const httpStatusCodes_1 = require("../../utils/httpStatusCodes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const authController = new authController_1.AuthController();
router.post('/signup', (0, asyncHandler_1.default)(authController.signup.bind(authController)));
router.post('/verify-otp', (0, asyncHandler_1.default)(authController.verifyUserOtp.bind(authController)));
router.post('/verify-login', (0, asyncHandler_1.default)(authController.verifyNow.bind(authController)));
router.post('/resend-otp', (0, asyncHandler_1.default)(authController.resendOTP.bind(authController)));
router.post('/login', (0, asyncHandler_1.default)(authController.login.bind(authController)));
router.post('/logout', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), (0, asyncHandler_1.default)(authController.logout.bind(authController)));
router.post('/forgot-password', (0, asyncHandler_1.default)(authController.requestPasswordReset.bind(authController)));
router.post('/reset-password/:token', (0, asyncHandler_1.default)(authController.resetUserPassword.bind(authController)));
// google auth route
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${config_1.default.frontendUrl}/login`,
    failureMessage: true
}), (req, res) => {
    const user = req.user;
    const { role, isBlocked, isRoleChanged } = user;
    console.log("role", role);
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, isBlocked: user.isBlocked, isRoleChanged: user.isRoleChanged, userDetails: user }, config_1.default.jwtSecret);
    console.log("redirect to ->", `${config_1.default.frontendUrl}/${role}/home`);
    const homePageUrl = `/${user.role}/home`;
    res.redirect(`${config_1.default.frontendUrl}/login?token=${token}&role=${role}&isBlocked=${isBlocked}&isRoleChanged=${isRoleChanged}&userData=${user}`);
});
// middleware to check err msg from failureRedirect
router.use((req, res, next) => {
    const sessionMessages = req.session.messages;
    if (req.session && sessionMessages) {
        console.log("Authentication failure message:", sessionMessages);
    }
    next();
});
router.get('/success', (req, res) => {
    console.log("req", req.user);
    if (req.user) {
        console.log("Google Auth successful");
        res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'Google Auth successful', user: req.user });
    }
    else {
        console.log("Not authenticated");
        res.status(httpStatusCodes_1.HttpStatus.UNAUTHORIZED).json({ message: 'Not authenticated' });
    }
});
exports.default = router;
