"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminAuthMiddleware_1 = require("../../middleware/adminAuthMiddleware");
const adminController_1 = require("../../controllers/adminController");
const router = express_1.default.Router();
const adminController = new adminController_1.AdminController();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
/* ADMIN ROUTES */
router.post('/login', asyncHandler(adminController.adminLogin.bind(adminController)));
// router.get("/home", adminAuthMiddleware, (req, res) => {
//     res.json({ message: "Welcome Admin!" });
// });
router.get('/users', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.fetchUsers.bind(adminController)));
router.patch('/user/block/:id', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.toggleUserBlock.bind(adminController)));
router.post('/switch-role', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.switchUserRole.bind(adminController)));
router.post('/create-notification', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.createNotification.bind(adminController)));
router.put('/update-notification/:id', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.updateNotification.bind(adminController)));
router.delete('/notification/delete/:id', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.deleteNotification.bind(adminController)));
router.put('/notification/update-status/:id', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.updateNotificationStatus.bind(adminController)));
router.get('/notifications', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.getNotifications.bind(adminController))); //all notifications
router.get('/notification/:id', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.getNotification.bind(adminController))); //single notification
router.get('/ai-rating', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.getAiRatings.bind(adminController))); //single notification
router.get('/community-chat', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.getCommunities.bind(adminController))); //single notification
router.delete('/community/:groupId', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.deleteCommunity.bind(adminController))); //single notification
router.delete('/community/:groupId/user/:userId', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.removeUserFromCommunity.bind(adminController))); //single notification
router.get('/dashboard/stats', adminAuthMiddleware_1.adminAuthMiddleware, asyncHandler(adminController.dashboard.bind(adminController))); //single notification
exports.default = router;
