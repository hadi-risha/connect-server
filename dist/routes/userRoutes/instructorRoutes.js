"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const verifyUserToken_1 = require("../../middleware/verifyUserToken");
const checkUserRole_1 = require("../../middleware/checkUserRole");
const instructorController_1 = require("../../controllers/instructorController");
const sharedController_1 = require("../../controllers/sharedController");
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
router.get('/profile', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.getProfile));
// router.get('/home', verifyToken, checkUserRole('instructor'), asyncHandler(instructorHome));
router.get('/sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.sessions));
router.put('/update-profile', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), upload.single('profilePic'), asyncHandler(instructorController_1.updateProfile)); // profilePic - should matches the field name in  frontend
router.get('/session/:sessionId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.getSession));
router.post('/create-session', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), upload.single('coverImage'), asyncHandler(instructorController_1.createSession));
router.put('/update-session', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), upload.single('coverImage'), asyncHandler(instructorController_1.updateSession));
router.delete('/delete-session/:sessionId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.deleteSession));
router.post('/switch-role', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.switchUserRole));
router.get('/booked-sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.bookedSessions));
router.get('/available-sessions', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.availableSessions));
router.get('/session-history', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.sessionHistory));
router.get('/sessions/search', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.searchSessions));
router.get('/notifications', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.fetchNotifications));
router.get('/notifications', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.fetchNotifications));
router.get('/chat', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.fetchChats)); //fetch a all chats and their details
router.get('/chat/all-users', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.allUsers)); //search users to chat
router.post('/chat/access', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.accessChat)); //header search, select a specific user to chat from the search, 
router.post('/message', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.sendMessage)); //to send or create a message
router.get('/message/:chatId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.allMessages)); //fetch all messages of single chat
router.post('/chat/new-group', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.createGroupChat));
router.put('/chat/rename', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.renameGroup));
router.put('/chat/group-add', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.addToGroup));
router.put('/chat/remove-user', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.removeFromGroup));
router.post('/create-post', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), upload.single('image'), asyncHandler(instructorController_1.createPost));
router.get('/posts', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.getFeedPosts));
router.patch('/post/:postId/like', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.likePost));
router.post('/post/comment/:postId', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.commentPost));
router.post('/ai/chat', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.createAiChat));
router.get('/ai/userchats', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.fetchAiChatlist));
router.get('/ai/chat/:id', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.fetchSingleAiChat));
router.put('/ai/chat/:id', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.updateExistingAiChat));
router.get('/wallet', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(instructorController_1.fetchWallet));
router.put('/change-password', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.changePassword));
router.post('/ai/rating', verifyUserToken_1.verifyToken, (0, checkUserRole_1.checkUserRole)('instructor'), asyncHandler(sharedController_1.aiRating));
exports.default = router;
