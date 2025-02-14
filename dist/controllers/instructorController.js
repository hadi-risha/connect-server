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
exports.fetchWallet = exports.commentPost = exports.likePost = exports.getFeedPosts = exports.createPost = exports.fetchNotifications = exports.searchSessions = exports.sessionHistory = exports.availableSessions = exports.bookedSessions = exports.switchUserRole = exports.deleteSession = exports.updateSession = exports.createSession = exports.getSession = exports.updateProfile = exports.sessions = exports.getProfile = void 0;
const userRepoService_1 = require("../services/userRepoService");
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const s3Service_1 = require("../utils/s3Service");
const mongoose_1 = __importDefault(require("mongoose"));
// import { getReceiverSocketId, io } from '../utils/socket';
const postModel_1 = require("../models/postModel");
const bookingModel_1 = require("../models/bookingModel");
const userService = new userRepoService_1.UserService();
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    try {
        const user = yield userService.findUserById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        const profile = yield userService.findUserById(id);
        if (!profile) {
            console.log("No details were found in the user profile", profile);
        }
        const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicUrl: ((_a = user.image) === null || _a === void 0 ? void 0 : _a.url) ? (_b = user.image) === null || _b === void 0 ? void 0 : _b.url : null,
            profilePicKey: ((_c = user.image) === null || _c === void 0 ? void 0 : _c.key) ? (_d = user.image) === null || _d === void 0 ? void 0 : _d.key : null,
            country: user.country,
            education: user.education,
            about: user.about,
            occupation: user === null || user === void 0 ? void 0 : user.occupation,
            currentInstitution: user === null || user === void 0 ? void 0 : user.currentInstitution,
            teachingViews: user === null || user === void 0 ? void 0 : user.teachingViews,
            achievements: user === null || user === void 0 ? void 0 : user.achievements,
            experience: user === null || user === void 0 ? void 0 : user.experience
        };
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "User profile fetched successfully" }, userData));
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the profile" });
    }
});
exports.getProfile = getProfile;
// export const instructorHome = async (req: Request, res: Response): Promise<Response> => {
//     let token = req.header("Authorization"); 
//     if (req.userData && typeof req.userData === 'object' && 'id' in req.userData) {
//       const id = (req.userData as { id: string }).id;       
//       try {
//           const user = await userService.findUserById(id);
//           return res.json({message: "user data", user });
//       } catch (error) {
//           return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching user' });
//       }
//     }
//     return res.status(HttpStatus.OK).json({ message: "Welcome to the instructor Home Page", userData: req.userData });
// };
const sessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessions = yield userService.fetchSessions();
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Sessions successfully fetched", sessions });
    }
    catch (error) {
        console.error("Failed to fetch sessions:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch sessions", error: error.message });
    }
});
exports.sessions = sessions;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { firstName, lastName, about, country, occupation, currentInstitution, teachingViews, achievements, education, experience, imageStatus } = req.body;
    console.log("imageStatus:- ", imageStatus);
    try {
        let token = req.header("Authorization");
        const { id, role } = req.userData;
        const profilePicFile = req.file;
        console.log("profilePicFile", profilePicFile);
        const key = req.file;
        console.log("image key >> req.file.key : ", key);
        const imageUnchanged = imageStatus === 'unchanged';
        const deleteProfilePic = imageStatus === 'deleted';
        const updateProfilePic = imageStatus === 'updated';
        // console.log("imageUnchanged     ", imageUnchanged);
        // console.log("updateProfilePic     ", updateProfilePic);
        // console.log("deleteProfilePic     ", deleteProfilePic);
        const existingProfile = yield userService.findUserById(id);
        if (!existingProfile) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User doesn't exist" });
        }
        console.log("image from frontend - key : ", profilePicFile);
        console.log("already exist image..from backend db        ", existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.image);
        // upload the profile picture to S3 if provided
        let profilePicUrl = '';
        if (profilePicFile && updateProfilePic) {
            console.log("profile pic changed");
            const { url: profilePicUrl, key: profilePicKey } = yield (0, s3Service_1.uploadImageToS3)(profilePicFile);
            existingProfile.image = {
                url: profilePicUrl,
                key: profilePicKey,
            };
            console.log("student profile uploaded in s3-", profilePicUrl);
            console.log("profilePicFile && updateProfilePic", profilePicFile, updateProfilePic);
        }
        else if (deleteProfilePic) {
            console.log("profile pic deleted");
            existingProfile.image = {
                url: undefined,
                key: undefined,
            };
        }
        else if (imageUnchanged) {
            console.log("profile pic not changed");
            existingProfile.image = {
                url: (_a = existingProfile.image) === null || _a === void 0 ? void 0 : _a.url,
                key: (_b = existingProfile.image) === null || _b === void 0 ? void 0 : _b.key,
            };
            console.log("No action needed, existing image values remain");
        }
        else {
            console.log("something went wrong in image upload", profilePicUrl);
            console.log("profilePicFile && updateProfilePic", profilePicFile, updateProfilePic);
        }
        existingProfile.firstName = firstName !== null && firstName !== void 0 ? firstName : existingProfile.firstName;
        existingProfile.lastName = lastName !== null && lastName !== void 0 ? lastName : existingProfile.lastName;
        if (about !== undefined)
            existingProfile.about = about;
        if (country !== undefined)
            existingProfile.country = country;
        if (occupation !== undefined)
            existingProfile.occupation = occupation;
        if (currentInstitution !== undefined)
            existingProfile.currentInstitution = currentInstitution;
        if (teachingViews !== undefined)
            existingProfile.teachingViews = teachingViews;
        if (achievements !== undefined)
            existingProfile.achievements = achievements;
        if (education !== undefined)
            existingProfile.education = education;
        if (experience !== undefined)
            existingProfile.experience = experience;
        const updatedProfile = yield userService.updateUserDetails(existingProfile);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Profile successfully updated", profile: updatedProfile });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the profile", error: error.message });
    }
});
exports.updateProfile = updateProfile;
const getSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { sessionId } = req.params;
    const { id, role } = req.userData;
    try {
        const user = yield userService.findUserById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Instructor not found" });
        }
        const session = yield userService.findSessionById(sessionId);
        if (!session) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Session not found" });
        }
        const sessionData = {
            id: session._id,
            title: session.title,
            introduction: session.introduction,
            duration: session.duration,
            fee: session.fee,
            descriptionTitle: session.descriptionTitle,
            description: session.description,
            timeSlots: session.timeSlots,
            sessionimgUrl: ((_a = session.coverImage) === null || _a === void 0 ? void 0 : _a.url) ? (_b = session.coverImage) === null || _b === void 0 ? void 0 : _b.url : null,
            sessionimgKey: ((_c = session.coverImage) === null || _c === void 0 ? void 0 : _c.key) ? (_d = session.coverImage) === null || _d === void 0 ? void 0 : _d.key : null,
            instructorId: (_e = session.instructorId) === null || _e === void 0 ? void 0 : _e._id,
            firstName: (_f = session.instructorId) === null || _f === void 0 ? void 0 : _f.firstName,
            lastName: (_g = session.instructorId) === null || _g === void 0 ? void 0 : _g.lastName,
            instructorImg: (_h = session.instructorId) === null || _h === void 0 ? void 0 : _h.image.url,
        };
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Session details fetched successfully" }, sessionData));
    }
    catch (error) {
        console.error("Error fetching session data:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the session deta" });
    }
});
exports.getSession = getSession;
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, introduction, duration, fee, descriptionTitle, description, category, rawTimeSlots } = req.body;
    const timeSlots = rawTimeSlots.split(',');
    console.log("req.body :- ", title, introduction, duration, fee, descriptionTitle, description, rawTimeSlots);
    console.log("session time rawTimeSlots :- ", rawTimeSlots);
    const coverImageFile = req.file;
    console.log("session cover image:- ", coverImageFile);
    if (!title) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Title required" });
    }
    if (!introduction) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Introduction required" });
    }
    if (!duration) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Duration required" });
    }
    if (!fee) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Fees required" });
    }
    if (!descriptionTitle) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Description title required" });
    }
    if (!description) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Description required" });
    }
    if (!rawTimeSlots) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Time slots are required" });
    }
    if (!category) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Category is required' });
    }
    if (!coverImageFile) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Cover image is required' });
    }
    if (!title.trim() ||
        !introduction.trim() ||
        !descriptionTitle.trim() ||
        !description.trim()) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Field cannot be empty" });
    }
    try {
        const { id, role } = req.userData;
        const { url: coverImageUrl, key: coverImageKey } = yield (0, s3Service_1.uploadImageToS3)(coverImageFile);
        console.log(" image url from  s3:- ", coverImageUrl);
        console.log(" image key from  s3:- ", coverImageKey);
        const existingInstructor = yield userService.findUserById(id);
        if (!existingInstructor) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Instructor doesn't exist, cannot create session" });
        }
        const session = yield userService.createSession({
            title,
            introduction,
            duration,
            fee,
            descriptionTitle,
            description,
            category,
            timeSlots,
            coverImage: {
                url: coverImageUrl,
                key: coverImageKey
            },
            instructorId: new mongoose_1.default.Types.ObjectId(id),
        });
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'Session successfully created', data: session, file: coverImageFile });
    }
    catch (error) {
        console.error("Error creating session profile:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the session", error: error.message });
    }
});
exports.createSession = createSession;
const updateSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { title, introduction, duration, fee, descriptionTitle, description, category, rawTimeSlots, imageStatus, sessionId } = req.body;
    console.log("(02:48,02:48,23:51 - format) rawTimeSlots:- ", rawTimeSlots);
    const timeSlots = rawTimeSlots.split(',');
    console.log("session time slots:- ", timeSlots);
    console.log("imageStatus -> ", imageStatus);
    const coverImageFile = req.file;
    console.log("cover image", coverImageFile);
    if (!title) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Title required" });
    }
    if (!introduction) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Introduction required" });
    }
    if (!duration) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Duration required" });
    }
    if (!fee) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Fees required" });
    }
    if (!descriptionTitle) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Description title required" });
    }
    if (!description) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Description required" });
    }
    if (!rawTimeSlots) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Time slots are required" });
    }
    if (!category) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Category required" });
    }
    if (!coverImageFile) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Cover image is required' });
    }
    if (!title.trim() ||
        !introduction.trim() ||
        !descriptionTitle.trim() ||
        !description.trim()) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Field cannot be empty" });
    }
    try {
        const { id, role } = req.userData;
        const imageUnchanged = imageStatus === 'unchanged';
        const deleteCoverImage = imageStatus === 'deleted';
        const updateCoverImage = imageStatus === 'updated';
        console.log("imageUnchanged:- ", imageUnchanged);
        console.log("updateProfilePic:- ", updateCoverImage);
        console.log("deleteProfilePic:- ", deleteCoverImage);
        const existingInstructor = yield userService.findUserById(id);
        if (!existingInstructor) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Instructor doesn't exist, cannot create session" });
        }
        const existingSession = yield userService.findSessionById(sessionId);
        if (!existingSession) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Session doesn't exist" });
        }
        console.log("already exist image from db:- ", (_a = existingSession === null || existingSession === void 0 ? void 0 : existingSession.coverImage) === null || _a === void 0 ? void 0 : _a.key);
        // upload the profile picture to S3 if new image provided
        let coverImageUrl = '';
        if (coverImageFile && updateCoverImage) {
            console.log("profile pic changed");
            const { url: coverImageUrl, key: coverImageKey } = yield (0, s3Service_1.uploadImageToS3)(coverImageFile);
            existingSession.coverImage = {
                url: coverImageUrl,
                key: coverImageKey,
            };
            console.log("cover image uploaded in s3:- ", coverImageKey);
        }
        else if (imageUnchanged) {
            console.log("cover image not changed");
            existingSession.coverImage = {
                url: (_b = existingSession.coverImage) === null || _b === void 0 ? void 0 : _b.url,
                key: (_c = existingSession.coverImage) === null || _c === void 0 ? void 0 : _c.key,
            };
        }
        else {
            console.log("something went wrong in image upload", coverImageUrl);
        }
        existingSession.title = title !== null && title !== void 0 ? title : existingSession.title;
        existingSession.introduction = introduction !== null && introduction !== void 0 ? introduction : existingSession.introduction;
        existingSession.duration = duration !== null && duration !== void 0 ? duration : existingSession.duration;
        existingSession.fee = fee !== null && fee !== void 0 ? fee : existingSession.fee;
        existingSession.descriptionTitle = descriptionTitle !== null && descriptionTitle !== void 0 ? descriptionTitle : existingSession.descriptionTitle;
        existingSession.description = description !== null && description !== void 0 ? description : existingSession.description;
        existingSession.category = category !== null && category !== void 0 ? category : existingSession.category;
        existingSession.timeSlots = timeSlots !== null && timeSlots !== void 0 ? timeSlots : existingSession.timeSlots;
        const updatedSession = yield userService.updateSessionDetails(existingSession);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Session Details successfully updated", session: updatedSession });
    }
    catch (error) {
        console.error("Error creating session:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the session", error: error.message });
    }
});
exports.updateSession = updateSession;
const deleteSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { sessionId } = req.params;
    try {
        const existingSession = yield userService.findSessionById(sessionId);
        if (!existingSession) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Session doesn't exist" });
        }
        // Delete the cover image from S3 if it exists
        if ((_a = existingSession.coverImage) === null || _a === void 0 ? void 0 : _a.key) {
            console.log("existingSession.coverImage.key:- ", existingSession.coverImage.key);
            // try {
            //   await deleteImageFromS3(existingSession.coverImage.key);
            //   console.log("Cover image deleted from S3");
            // } catch (s3Error) {
            //   console.error("Error deleting image from S3:", s3Error);
            //   return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error deleting session image from S3" });
            // }
        }
        // Delete the session from the database
        const wasDeleted = yield userService.deleteSessionById(sessionId);
        if (!wasDeleted) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Session not found or already deleted" });
        }
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Session successfully deleted" });
    }
    catch (error) {
        console.error("Error deleting session:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while deleting the session", error: error.message });
    }
});
exports.deleteSession = deleteSession;
const switchUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.userData;
    const newRole = 'student';
    try {
        const updatedUser = yield userService.switchUserRole(id, newRole);
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json(Object.assign({ message: "User role updated successfully" }, updatedUser));
    }
    catch (error) {
        console.error("Error updating user role:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
    }
});
exports.switchUserRole = switchUserRole;
const bookedSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.userData;
    try {
        const bookedSessions = yield userService.instructorBookedSessions(id);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Booked sessions fetched successfully" }, bookedSessions));
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching booked sessions:" });
    }
});
exports.bookedSessions = bookedSessions;
const availableSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.userData;
    try {
        const availableSessions = yield userService.instructorAvailableSessions(id);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Instructor sessions fetched successfully" }, availableSessions));
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching instructor sessions:" });
    }
});
exports.availableSessions = availableSessions;
const sessionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.userData;
    try {
        const bookedSessions = yield userService.instructorSessionHistory(id);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Session history fetched successfully", historyData: bookedSessions });
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching history:" });
    }
});
exports.sessionHistory = sessionHistory;
const searchSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    const { id } = req.userData;
    if (!query) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Query parameter is required" });
    }
    try {
        const searchResults = yield userService.instructorSearchSessions(query, id);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Search results fetched successfully", searchResults });
    }
    catch (error) {
        console.error("Error performing search:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error performing search" });
    }
});
exports.searchSessions = searchSessions;
const fetchNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        const notifications = yield userService.fetchNotifications();
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Notifications fetched successfully", notifications, });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notifications:" });
    }
});
exports.fetchNotifications = fetchNotifications;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description } = req.body;
    const image = req.file;
    console.log("post image:- ", image);
    if (!description) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Description required' });
    }
    if (!description.trim()) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Field cannot be empty" });
    }
    if (!image) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Cover image is required' });
    }
    try {
        const { id, role } = req.userData;
        const { url: imageUrl, key: imageKey } = yield (0, s3Service_1.uploadImageToS3)(image);
        console.log(" image url from  s3:- ", imageUrl);
        console.log(" image key from  s3:- ", imageKey);
        const existingInstructor = yield userService.findUserById(id);
        if (!existingInstructor) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Instructor doesn't exist, cannot create post" });
        }
        const post = yield userService.createPost({
            instructorId: new mongoose_1.default.Types.ObjectId(id),
            description,
            image: {
                url: imageUrl,
                key: imageKey
            },
        });
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'Post successfully created', post: post });
    }
    catch (error) {
        console.error("Error creating session profile:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the session", error: error.message });
    }
});
exports.createPost = createPost;
const getFeedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.userData;
    try {
        const allPosts = yield userService.fetchPosts();
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Posts fetched successfully", posts: allPosts });
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching posts:" });
    }
});
exports.getFeedPosts = getFeedPosts;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id, role } = req.userData;
        const { postId } = req.params;
        const post = yield postModel_1.PostModel.findById(postId);
        if (!(post === null || post === void 0 ? void 0 : post.likes)) {
            throw new Error("Post likes are undefined");
        }
        const isLiked = (_a = post === null || post === void 0 ? void 0 : post.likes) === null || _a === void 0 ? void 0 : _a.get(id); //get - in Map, this method checks if the userId exists as a key
        if (isLiked) {
            (_b = post === null || post === void 0 ? void 0 : post.likes) === null || _b === void 0 ? void 0 : _b.delete(id); //delete - in Map, removing like(or userid) from already liked post,
        }
        else {
            (_c = post === null || post === void 0 ? void 0 : post.likes) === null || _c === void 0 ? void 0 : _c.set(id, true); //userId is the key, true is the value 
        }
        const updatedPost = yield postModel_1.PostModel.findByIdAndUpdate(postId, { likes: post.likes }, { new: true } //if do not specify this option or set it to false, Mongoose will return the og document before the update.
        );
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Chat List fetched successfully", updatedPost: updatedPost });
    }
    catch (error) {
        console.error("Error fetching chat:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching chat:" });
    }
});
exports.likePost = likePost;
const commentPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.userData;
        const { postId } = req.params;
        const { comment } = req.body;
        const post = yield postModel_1.PostModel.findById(postId);
        if (!post) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Post not found" });
        }
        // Create a comment object, ensuring userId is cast to ObjectId
        const newComment = {
            userId: new mongoose_1.default.Types.ObjectId(id),
            comment: comment,
        };
        // Add the new comment to the comments array
        (_a = post === null || post === void 0 ? void 0 : post.comments) === null || _a === void 0 ? void 0 : _a.push(newComment);
        // Save the updated post with the new comment
        const updatedPost = yield post.save();
        // Populate instructor details for the updated post
        const updatedPostData = yield postModel_1.PostModel.findById(updatedPost._id).populate({
            path: 'instructorId',
            select: '_id firstName lastName role country image.url',
        });
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({
            message: "Comment added successfully",
            updatedPost: updatedPostData,
        });
    }
    catch (error) {
        console.error("Error adding comment:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error adding comment",
        });
    }
});
exports.commentPost = commentPost;
const fetchWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        const walletData = yield bookingModel_1.BookingModel.find({ instructorId: id })
            .populate("studentId", "_id firstName lastName image.url")
            .populate("sessionId", "fee");
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Wallet data fetched successfully", walletData: walletData });
    }
    catch (error) {
        console.error("Error fetching Ai chatlist:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the wallet data." });
    }
});
exports.fetchWallet = fetchWallet;
