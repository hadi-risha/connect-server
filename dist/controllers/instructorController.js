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
exports.availableSessions = exports.bookedSessions = exports.switchUserRole = exports.deleteSession = exports.updateSession = exports.createSession = exports.getSession = exports.updateProfile = exports.getProfile = exports.sessions = exports.instructorHome = void 0;
const userService_1 = require("../services/userService");
const s3Service_1 = require("../utils/s3Service");
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const mongoose_1 = __importDefault(require("mongoose"));
const userService = new userService_1.UserService();
/* INSTRUCTOR HOME */
const instructorHome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.userData in instructor home page", req.userData);
    let token = req.header("Authorization");
    console.log("token in instructor home", token);
    if (req.userData && typeof req.userData === 'object' && 'id' in req.userData) {
        const id = req.userData.id;
        console.log("id", id);
        try {
            const user = yield userService.findUserById(id);
            console.log(user);
            return res.json({ message: "user data", user });
        }
        catch (error) {
            return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching user' });
        }
    }
    return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Welcome to the instructor Home Page", userData: req.userData });
});
exports.instructorHome = instructorHome;
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
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let token = req.header("Authorization");
    console.log("token in get profile", token);
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("req.userData ", req.userData);
    try {
        const user = yield userService.findUserById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        else {
            console.log("details found in user", user);
        }
        const profile = yield userService.findUserById(id);
        if (!profile) {
            console.log("no details found from user profile", profile);
        }
        else {
            console.log("details found in user profile", profile);
        }
        const userData = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicUrl: ((_a = user.image) === null || _a === void 0 ? void 0 : _a.url) ? (_b = user.image) === null || _b === void 0 ? void 0 : _b.url : null,
            profilePicKey: ((_c = user.image) === null || _c === void 0 ? void 0 : _c.key) ? (_d = user.image) === null || _d === void 0 ? void 0 : _d.key : null,
            country: user.country,
            occupation: user.occupation,
            education: user.education,
            about: user.about,
            currentInstitution: user.currentInstitution,
            teachingViews: user.teachingViews,
            achievements: user.achievements,
            experience: user.experience
        };
        console.log("userData:", userData);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "User profile fetched successfully" }, userData));
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the profile" });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("instructor update profile page*******************************************************************************************");
    const { firstName, lastName, about, country, occupation, currentInstitution, teachingViews, achievements, education, experience, imageStatus } = req.body;
    console.log("imageStatus.....................>>   ", imageStatus);
    try {
        let token = req.header("Authorization");
        console.log("token in instructor update profile", token);
        const { id, role } = req.userData;
        console.log("id, role", id, role);
        const profilePicFile = req.file;
        console.log("profilePicFile", profilePicFile);
        const key = req.file;
        console.log("image,   req.file.key : ", key);
        const imageUnchanged = imageStatus === 'unchanged';
        const deleteProfilePic = imageStatus === 'deleted';
        const updateProfilePic = imageStatus === 'updated';
        console.log("imageUnchanged     ", imageUnchanged);
        console.log("updateProfilePic     ", updateProfilePic);
        console.log("deleteProfilePic     ", deleteProfilePic);
        const existingProfile = yield userService.findUserById(id);
        if (!existingProfile) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User doesn't exist" });
        }
        console.log("image from frontend -------------- key : ", profilePicFile);
        console.log("already exist image............from backend db        ", existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.image);
        // upload the profile picture to S3 if provided
        let profilePicUrl = '';
        if (profilePicFile && updateProfilePic) {
            console.log("profile pic changed");
            const { url: profilePicUrl, key: profilePicKey } = yield (0, s3Service_1.uploadImageToS3)(profilePicFile);
            existingProfile.image = {
                url: profilePicUrl,
                key: profilePicKey,
            };
            console.log("student profile uploaded in s3-----------------------==", profilePicUrl);
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
            // No action needed; existing image values remain
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
        //  await userService.updateUserNames(id, { firstName, lastName });
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    console.log("***GET SESSION****");
    const { sessionId } = req.params;
    console.log("sessionId:- ", sessionId);
    const { id, role } = req.userData;
    console.log("id, role:- ", id, role);
    try {
        const user = yield userService.findUserById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Instructor not found" });
        }
        const session = yield userService.findSessionById(sessionId);
        if (!session) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Session not found" });
        }
        console.log("session info:- ", session);
        // console.log("session info instructorId:- ", session.instructorId?.firstName, session.instructorId?.lastName, session.instructorId?.image.url);
        // _id firstName lastName image.url
        console.log("session info instructorId:- *******************************************", (_a = session.instructorId) === null || _a === void 0 ? void 0 : _a.firstName, (_b = session.instructorId) === null || _b === void 0 ? void 0 : _b.lastName, (_c = session.instructorId) === null || _c === void 0 ? void 0 : _c.image.url, (_d = session.instructorId) === null || _d === void 0 ? void 0 : _d._id);
        const sessionData = {
            id: session._id,
            title: session.title,
            introduction: session.introduction,
            duration: session.duration,
            fee: session.fee,
            descriptionTitle: session.descriptionTitle,
            description: session.description,
            timeSlots: session.timeSlots,
            sessionimgUrl: ((_e = session.coverImage) === null || _e === void 0 ? void 0 : _e.url) ? (_f = session.coverImage) === null || _f === void 0 ? void 0 : _f.url : null,
            sessionimgKey: ((_g = session.coverImage) === null || _g === void 0 ? void 0 : _g.key) ? (_h = session.coverImage) === null || _h === void 0 ? void 0 : _h.key : null,
            instructorId: (_j = session.instructorId) === null || _j === void 0 ? void 0 : _j._id,
            firstName: (_k = session.instructorId) === null || _k === void 0 ? void 0 : _k.firstName,
            lastName: (_l = session.instructorId) === null || _l === void 0 ? void 0 : _l.lastName,
            instructorImg: (_m = session.instructorId) === null || _m === void 0 ? void 0 : _m.image.url,
        };
        console.log("sessionData:- ", sessionData);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Session details fetched successfully" }, sessionData));
    }
    catch (error) {
        console.error("Error fetching session data:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the session deta" });
    }
});
exports.getSession = getSession;
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("***CREATE SESSION****");
    const { title, introduction, duration, fee, descriptionTitle, description, rawTimeSlots } = req.body;
    const timeSlots = rawTimeSlots.split(',');
    console.log("req.body:- ", title, introduction, duration, fee, descriptionTitle, description, rawTimeSlots);
    console.log("session time rawTimeSlots:- ", rawTimeSlots);
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
        console.log("id, role:- ", id, role);
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
    console.log("***UPDATE SESSION****");
    const { title, introduction, duration, fee, descriptionTitle, description, rawTimeSlots, imageStatus, sessionId } = req.body;
    console.log("req.body:- ", title, introduction, duration, fee, descriptionTitle, description, rawTimeSlots, imageStatus, sessionId);
    console.log("02:48,02:48,23:51 rawTimeSlots:- ", rawTimeSlots);
    const timeSlots = rawTimeSlots.split(',');
    console.log("session time slots:- ", timeSlots);
    console.log("imageStatus.....................>>   ", imageStatus);
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
        console.log("id, role:- ", id, role);
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
    // const { userId } = req.body;
    console.log("in update roleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    let token = req.header("Authorization");
    console.log("token in instructor role switch", token);
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    const newRole = 'student';
    try {
        const updatedUser = yield userService.switchUserRole(id, newRole);
        console.log("updatedUser-----------", updatedUser);
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json(Object.assign({ message: "User role updated successfully" }, updatedUser));
    }
    catch (error) {
        console.error("Error updating user role:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
    }
});
exports.switchUserRole = switchUserRole;
const bookedSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { userId } = req.body;
    let token = req.header("Authorization");
    console.log("token in student payment", token);
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    try {
        // const updatedUser = await userService.switchUserRole(id, newRole)
        const bookedSessions = yield userService.instructorBookedSessions(id);
        console.log("Booked sessions-----------", bookedSessions);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Booked sessions fetched successfully" }, bookedSessions));
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching booked sessions:" });
    }
});
exports.bookedSessions = bookedSessions;
const availableSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { userId } = req.body;
    let token = req.header("Authorization");
    console.log("token in student payment", token);
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    try {
        // const updatedUser = await userService.switchUserRole(id, newRole)
        const availableSessions = yield userService.instructorAvailableSessions(id);
        console.log("Booked sessions-----------", availableSessions);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Instructor sessions fetched successfully" }, availableSessions));
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching instructor sessions:" });
    }
});
exports.availableSessions = availableSessions;
