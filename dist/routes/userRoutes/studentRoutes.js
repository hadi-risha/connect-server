"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_js_1 = require("../../controllers/studentController.js");
const verifyUserToken_js_1 = require("../../middleware/verifyUserToken.js");
const checkUserRole_js_1 = require("../../middleware/checkUserRole.js");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/* STUDENT HOME */
router.get('/sessions', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), asyncHandler(studentController_js_1.sessions));
router.get('/session/:id', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), asyncHandler(studentController_js_1.session));
router.put('/update-profile', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), upload.single('profilePic'), asyncHandler(studentController_js_1.updateProfile)); // profilePic - should matches the field name in  frontend
router.get('/profile', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), asyncHandler(studentController_js_1.getProfile));
// router.post('/create-booking', verifyToken, checkUserRole('student'), asyncHandler(createBooking));  
// router.post('/payment', verifyToken, checkUserRole('student'), asyncHandler(stripePayment));  
router.post('/book-and-pay', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), asyncHandler(studentController_js_1.createBookingAndPayment));
router.post('/switch-role', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), asyncHandler(studentController_js_1.switchUserRole));
router.get('/booked-sessions', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), asyncHandler(studentController_js_1.bookedSessions));
router.put('/cancel-booking', verifyUserToken_js_1.verifyToken, (0, checkUserRole_js_1.checkUserRole)('student'), asyncHandler(studentController_js_1.cancelBooking));
exports.default = router;
