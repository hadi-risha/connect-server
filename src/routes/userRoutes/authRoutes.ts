import express, { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../../controllers/authController';
import asyncHandler from '../../middleware/asyncHandler';
import { checkUserRole } from '../../middleware/checkUserRole';
import { verifyToken } from '../../middleware/verifyUserToken';
import passport from 'passport';
import config from '../../config/config';
import { HttpStatus } from '../../utils/httpStatusCodes'
import jwt from 'jsonwebtoken';

const router: Router = express.Router();
const authController = new AuthController();

router.post('/signup', asyncHandler(authController.signup.bind(authController)));
router.post('/verify-otp', asyncHandler(authController.verifyUserOtp.bind(authController)));
router.post('/verify-login', asyncHandler(authController.verifyNow.bind(authController)));
router.post('/resend-otp', asyncHandler(authController.resendOTP.bind(authController)));
router.post('/login', asyncHandler(authController.login.bind(authController)));
router.post('/logout', verifyToken, checkUserRole('student'), asyncHandler(authController.logout.bind(authController)));

router.post('/forgot-password', asyncHandler(authController.requestPasswordReset.bind(authController)));
router.post('/reset-password/:token', asyncHandler(authController.resetUserPassword.bind(authController)));








// google auth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
interface CustomUser {
    _id: string;
    googleId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;

    isBlocked: boolean;
    isRoleChanged: boolean;
}
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${config.frontendUrl}/login`,
        failureMessage: true 
    }),
    (req: Request, res: Response) => {
        const user = req.user as CustomUser;
        const { role, isBlocked, isRoleChanged } = user;

        const token = jwt.sign({ id: user._id, role: user.role, isBlocked: user.isBlocked, isRoleChanged: user.isRoleChanged, userDetails: user }, config.jwtSecret );

        console.log("redirect to ->", `${config.frontendUrl}/${role}/home`);
        const homePageUrl = `/${user.role}/home`;

        res.redirect(`${config.frontendUrl}/login?token=${token}&role=${role}&isBlocked=${isBlocked}&isRoleChanged=${isRoleChanged}&userData=${user}`);
    }
);  

// middleware to check err msg from failureRedirect
router.use((req, res, next) => {
    const sessionMessages = (req.session as any).messages;
    if (req.session && sessionMessages) {
        console.log("Authentication failure message:", sessionMessages);
    }
    next();
});


router.get('/success', (req, res) => {
    console.log("req", req.user);
    if (req.user) {
        res.status(HttpStatus.OK).json({ message: 'Google Auth successful', user: req.user });
    } else {
        console.log("Not authenticated");
        res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Not authenticated' });
    }
});





export default router;