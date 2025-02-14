"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const instructorController_1 = require("../../controllers/instructorController");
const verifyUserToken_1 = require("../../middleware/verifyUserToken");
const checkUserRole_1 = require("../../middleware/checkUserRole");
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
router.get('/home', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.instructorHome));
router.get('/sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.sessions));
router.get('/profile', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.getProfile));
router.put('/update-profile', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), upload.single('profilePic'), asyncHandler(instructorController_1.updateProfile)); // profilePic - should matches the field name in  frontend
router.get('/session/:sessionId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.getSession));
router.post('/create-session', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), upload.single('coverImage'), asyncHandler(instructorController_1.createSession));
router.put('/update-session', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), upload.single('coverImage'), asyncHandler(instructorController_1.updateSession));
router.delete('/delete-session/:sessionId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.deleteSession));
router.post('/switch-role', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.switchUserRole));
router.get('/booked-sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.bookedSessions));
router.get('/available-sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.availableSessions));
// router.get('/home',  asyncHandler(instructorHome));
exports.default = router;
