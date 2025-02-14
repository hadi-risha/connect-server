
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { verifyToken } from '../../middleware/verifyUserToken';
import { checkUserRole } from '../../middleware/checkUserRole';
import { availableSessions, bookedSessions, commentPost, createPost, 
    createSession, deleteSession, fetchNotifications, 
    fetchWallet, getFeedPosts, getProfile, getSession, 
    // instructorHome, 
    likePost, searchSessions, sessionHistory, sessions, 
    switchUserRole, updateProfile, updateSession } from '../../controllers/instructorController';
import { accessChat, addToGroup, aiRating, allMessages, allUsers, changePassword,
     createAiChat, createGroupChat, fetchAiChatlist, fetchChats,
    fetchSingleAiChat, removeFromGroup, renameGroup, sendMessage, 
    updateExistingAiChat } from '../../controllers/sharedController';




const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};


router.get('/profile', verifyToken, checkUserRole('instructor'), asyncHandler(getProfile)); 


// router.get('/home', verifyToken, checkUserRole('instructor'), asyncHandler(instructorHome));

router.get('/sessions', verifyToken, checkUserRole('instructor'), asyncHandler(sessions));

router.put('/update-profile', verifyToken, checkUserRole('instructor'), upload.single('profilePic'), asyncHandler(updateProfile));  // profilePic - should matches the field name in  frontend

router.get('/session/:sessionId', verifyToken, checkUserRole('instructor'), asyncHandler(getSession)); 

router.post('/create-session', verifyToken, checkUserRole('instructor'), upload.single('coverImage'), asyncHandler(createSession)); 

router.put('/update-session', verifyToken, checkUserRole('instructor'), upload.single('coverImage'), asyncHandler(updateSession)); 

router.delete('/delete-session/:sessionId', verifyToken, checkUserRole('instructor'), asyncHandler(deleteSession));

router.post('/switch-role', verifyToken, checkUserRole('instructor'), asyncHandler(switchUserRole)); 

router.get('/booked-sessions', verifyToken, checkUserRole('instructor'), asyncHandler(bookedSessions));  

router.get('/available-sessions', verifyToken, checkUserRole('instructor'), asyncHandler(availableSessions)); 

router.get('/session-history', verifyToken, checkUserRole('instructor'), asyncHandler(sessionHistory));

router.get('/sessions/search', verifyToken, checkUserRole('instructor'), asyncHandler(searchSessions)); 
 
router.get('/notifications', verifyToken, checkUserRole('instructor'), asyncHandler(fetchNotifications)); 

router.get('/notifications', verifyToken, checkUserRole('instructor'), asyncHandler(fetchNotifications)); 





router.get('/chat', verifyToken, checkUserRole('instructor'), asyncHandler(fetchChats));  //fetch a all chats and their details
router.get('/chat/all-users', verifyToken, checkUserRole('instructor'), asyncHandler(allUsers));  //search users to chat
router.post('/chat/access', verifyToken, checkUserRole('instructor'), asyncHandler(accessChat));  //header search, select a specific user to chat from the search, 

router.post('/message', verifyToken, checkUserRole('instructor'), asyncHandler(sendMessage)); //to send or create a message
router.get('/message/:chatId', verifyToken, checkUserRole('instructor'), asyncHandler(allMessages));   //fetch all messages of single chat

router.post('/chat/new-group', verifyToken, checkUserRole('instructor'), asyncHandler(createGroupChat)); 
router.put('/chat/rename', verifyToken, checkUserRole('instructor'), asyncHandler(renameGroup)); 
router.put('/chat/group-add', verifyToken, checkUserRole('instructor'), asyncHandler(addToGroup)); 
router.put('/chat/remove-user', verifyToken, checkUserRole('instructor'), asyncHandler(removeFromGroup)); 





router.post('/create-post', verifyToken, checkUserRole('instructor'),  upload.single('image'), asyncHandler(createPost)); 
router.get('/posts', verifyToken, checkUserRole('instructor'), asyncHandler(getFeedPosts)); 
router.patch('/post/:postId/like', verifyToken, checkUserRole('instructor'), asyncHandler(likePost)); 
router.post('/post/comment/:postId', verifyToken, checkUserRole('instructor'), asyncHandler(commentPost)); 


router.post('/ai/chat', verifyToken, checkUserRole('instructor'), asyncHandler(createAiChat)); 
router.get('/ai/userchats', verifyToken, checkUserRole('instructor'), asyncHandler(fetchAiChatlist)); 
router.get('/ai/chat/:id', verifyToken, checkUserRole('instructor'), asyncHandler(fetchSingleAiChat));
router.put('/ai/chat/:id', verifyToken, checkUserRole('instructor'), asyncHandler(updateExistingAiChat)); 


router.get('/wallet', verifyToken, checkUserRole('instructor'), asyncHandler(fetchWallet)); 

router.put('/change-password', verifyToken, checkUserRole('instructor'), asyncHandler(changePassword)); 

router.post('/ai/rating', verifyToken, checkUserRole('instructor'), asyncHandler(aiRating)); 






export default router;
