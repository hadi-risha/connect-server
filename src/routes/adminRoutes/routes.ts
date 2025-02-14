import express, { Request, Response, NextFunction } from 'express';
import { adminAuthMiddleware } from '../../middleware/adminAuthMiddleware';
import { AdminController } from '../../controllers/adminController';

const router = express.Router();
const adminController = new AdminController();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);


/* ADMIN ROUTES */
router.post('/login', asyncHandler(adminController.adminLogin.bind(adminController)));

// router.get("/home", adminAuthMiddleware, (req, res) => {
//     res.json({ message: "Welcome Admin!" });
// });

router.get('/users', adminAuthMiddleware, asyncHandler(adminController.fetchUsers.bind(adminController)) );
router.patch('/user/block/:id', adminAuthMiddleware, asyncHandler(adminController.toggleUserBlock.bind(adminController)) );
router.post('/switch-role', adminAuthMiddleware, asyncHandler(adminController.switchUserRole.bind(adminController)) );


router.post('/create-notification', adminAuthMiddleware, asyncHandler(adminController.createNotification.bind(adminController)) );
router.put('/update-notification/:id', adminAuthMiddleware, asyncHandler(adminController.updateNotification.bind(adminController)) );

router.delete('/notification/delete/:id', adminAuthMiddleware, asyncHandler(adminController.deleteNotification.bind(adminController)) );
router.put('/notification/update-status/:id', adminAuthMiddleware, asyncHandler(adminController.updateNotificationStatus.bind(adminController)) );

router.get('/notifications', adminAuthMiddleware, asyncHandler(adminController.getNotifications.bind(adminController)) ); //all notifications

router.get('/notification/:id', adminAuthMiddleware, asyncHandler(adminController.getNotification.bind(adminController)) ); //single notification


router.get('/ai-rating', adminAuthMiddleware, asyncHandler(adminController.getAiRatings.bind(adminController)) ); //single notification


router.get('/community-chat', adminAuthMiddleware, asyncHandler(adminController.getCommunities.bind(adminController)) ); //single notification

router.delete('/community/:groupId', adminAuthMiddleware, asyncHandler(adminController.deleteCommunity.bind(adminController)) ); //single notification

router.delete('/community/:groupId/user/:userId', adminAuthMiddleware, asyncHandler(adminController.removeUserFromCommunity.bind(adminController)) ); //single notification


router.get('/dashboard/stats', adminAuthMiddleware, asyncHandler(adminController.dashboard.bind(adminController)) ); //single notification




export default router;
