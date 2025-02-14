"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const verifyUserToken_1 = require("../../middleware/verifyUserToken");
const checkUserRole_1 = require("../../middleware/checkUserRole");
const studentController_1 = require("../../controllers/studentController");
const sharedController_1 = require("../../controllers/sharedController");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
router.get('/profile', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.getProfile));
router.get('/sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.sessions));
router.get('/session/:id', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.session));
router.put('/update-profile', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), upload.single('profilePic'), asyncHandler(studentController_1.updateProfile)); // profilePic - should matches the field name in  frontend
router.post('/book-and-pay', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.createBookingAndPayment));
router.post('/switch-role', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.switchUserRole));
router.get('/booked-sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.bookedSessions));
router.put('/cancel-booking', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.cancelBooking));
router.get('/sessions/search', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.searchSessions));
router.get('/session-history', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.sessionHistory));
router.get('/pending-sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.pendingSessions));
router.post('/rate', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.rateInstructor));
router.post('/session-complete/rating', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.completeSessionAndRateInstructor));
router.get('/notifications', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.fetchNotifications));
router.get('/chat', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.fetchChats)); //fetch a all chats and their details
router.get('/chat/all-users', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.allUsers)); //search users to chat
router.post('/chat/access', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.accessChat)); //header search, select a specific user to chat from the search, 
router.post('/message', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.sendMessage)); //to send or create a message
router.get('/message/:chatId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.allMessages)); //fetch all messages of single chat
router.post('/chat/new-group', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.createGroupChat));
router.put('/chat/rename', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.renameGroup));
router.put('/chat/group-add', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.addToGroup));
router.put('/chat/remove-user', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.removeFromGroup));
router.get('/posts', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.getFeedPosts));
router.patch('/post/:postId/like', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.likePost));
router.post('/post/comment/:postId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.commentPost));
router.post('/ai/chat', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.createAiChat));
router.get('/ai/userchats', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.fetchAiChatlist));
router.get('/ai/chat/:id', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.fetchSingleAiChat));
router.put('/ai/chat/:id', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.updateExistingAiChat));
router.put('/change-password', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.changePassword));
router.patch('/wishlist', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.toggleWishlist));
router.get('/wishlist/check/:sessionId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.isSessionInWishlist));
router.patch('/wishlist/:sessionId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.removeFromwishlist));
router.get('/wishlist/sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.wishlistSessions));
router.post('/ai/rating', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(sharedController_1.aiRating));
router.get('/instructors', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.getInstructors));
router.get('/view-profile/:instId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('student'), asyncHandler(studentController_1.getInstructorProfile));
exports.default = router;
