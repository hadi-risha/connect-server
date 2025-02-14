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
exports.UserRepository = void 0;
const userModel_1 = require("../models/userModel");
const sessionModel_1 = require("../models/sessionModel");
const bookingModel_1 = require("../models/bookingModel");
const mongoose_1 = __importDefault(require("mongoose"));
const ratingModel_1 = require("../models/ratingModel");
const notificationModel_1 = require("../models/notificationModel");
const postModel_1 = require("../models/postModel");
class UserRepository {
    // ***
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = new userModel_1.UserModel(userData);
                return yield newUser.save();
            }
            catch (error) {
                throw new Error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // ***
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.UserModel.findOne({ email });
            }
            catch (error) {
                throw new Error(`Error finding user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // ***
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.UserModel.findById(id);
            }
            catch (error) {
                throw new Error(`Error finding user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // ***
    updateUserVerification(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.UserModel.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
            }
            catch (error) {
                throw new Error(`Error updating user verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // ***
    findUserByResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userModel_1.UserModel.findOne({ resetPasswordToken: token });
                if (user) {
                    if (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date()) {
                        // Token expired
                        user.resetPasswordToken = null;
                        user.resetPasswordExpiry = null;
                        yield user.save();
                        return null;
                    }
                    return user;
                }
                return null;
            }
            catch (error) {
                throw new Error(`Error finding user by reset token: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // async findUserByGoogleId(googleId: string): Promise<IUser | null> {
    //     try {
    //         return await UserModel.findOne({ googleId });
    //     } catch (error) {
    //         throw new Error(`Error finding user by Google ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    //     }
    // }
    updateUserDetails(profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in update profile repository");
                const updatedProfile = yield userModel_1.UserModel.findByIdAndUpdate(profileData._id, profileData, { new: true }).exec();
                if (!updatedProfile) {
                    console.log("Profile not found");
                    throw new Error("Profile not found");
                }
                return updatedProfile;
            }
            catch (error) {
                throw new Error(`Error updating user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    createSession(sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in create user repository");
                const newSession = new sessionModel_1.SessionModel(sessionData);
                console.log("newSession:- ", newSession);
                return yield newSession.save();
            }
            catch (error) {
                throw new Error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    findSessionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield sessionModel_1.SessionModel.findById(id)
                    .populate({
                    path: 'instructorId',
                    select: '_id firstName lastName image.url',
                });
            }
            catch (error) {
                throw new Error(`Error finding session by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    updateSessionDetails(sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in update session data repository");
                const updatedSession = yield sessionModel_1.SessionModel.findByIdAndUpdate(sessionData._id, sessionData, { new: true }).exec();
                if (!updatedSession) {
                    console.log("Session not found");
                    throw new Error("Session not found");
                }
                return updatedSession;
            }
            catch (error) {
                throw new Error(`Error updating user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    deleteSessionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedSession = yield sessionModel_1.SessionModel.findByIdAndDelete(id);
            return !!deletedSession; // Returns true if a session was deleted, otherwise false
        });
    }
    createBooking(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in create booking repository");
                const newBooking = new bookingModel_1.BookingModel(bookingData);
                console.log("newBooking:- ", newBooking);
                return yield newBooking.save();
            }
            catch (error) {
                throw new Error(`Error creating booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    fetchSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield sessionModel_1.SessionModel.find()
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'instructorId',
                    select: 'firstName lastName',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    switchUserRole(id, newRole) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in update user role repository");
                const updatedUser = yield userModel_1.UserModel.findByIdAndUpdate(id, { role: newRole }, { new: true }).exec();
                if (!updatedUser) {
                    console.log("User not found");
                    throw new Error("User not found");
                }
                return updatedUser;
            }
            catch (error) {
                throw new Error(`Error updating user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    bookedSessions(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.find({ studentId })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'instructorId',
                    select: 'firstName lastName email',
                })
                    .populate({
                    path: 'sessionId',
                    select: '_id title duration fee descriptionTitle coverImage.url',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    instructorBookedSessions(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.find({ instructorId: id })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'studentId',
                    select: '_id firstName lastName email image.url',
                })
                    .populate({
                    path: 'instructorId',
                    select: 'firstName lastName email',
                })
                    .populate({
                    path: 'sessionId',
                    select: '_id title duration fee descriptionTitle coverImage.url',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    instructorAvailableSessions(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield sessionModel_1.SessionModel.find({ instructorId: id })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'instructorId',
                    select: '_id firstName lastName email',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    updateIsRoleChanged(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.UserModel.findOneAndUpdate({ _id: id }, { isRoleChanged: false }, { new: true });
            }
            catch (error) {
                throw new Error(`Error updating user verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    findBookingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.findById(id);
            }
            catch (error) {
                throw new Error(`Error finding booking by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    findBookingByIdS(studentId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.findOne({ studentId, sessionId });
            }
            catch (error) {
                throw new Error(`Error finding booking by IDs: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        });
    }
    searchSessions(query, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchRegex = new RegExp(query, 'i'); // Case-insensitive regex for partial matches
                const sessions = yield sessionModel_1.SessionModel.aggregate([
                    {
                        $match: {
                            $or: [
                                { title: searchRegex },
                                { description: searchRegex },
                                { category: searchRegex }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: 'bookings', // Name of the bookings collection
                            localField: '_id',
                            foreignField: 'sessionId',
                            as: 'bookings'
                        }
                    },
                    {
                        $addFields: {
                            bookingStatus: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$bookings",
                                            as: "booking",
                                            cond: { $eq: ["$$booking.studentId", new mongoose_1.default.Types.ObjectId(userId)] }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            bookings: 0, // Exclude the entire bookings array
                        }
                    },
                    { $sort: { createdAt: -1 } } // Sort by creation date
                ]);
                return sessions;
            }
            catch (error) {
                throw new Error(`Failed to perform search: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    instructorSearchSessions(query, instructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchRegex = new RegExp(query, 'i'); // Case-insensitive regex for partial matches
                // Convert instructorId to mongoose.Types.ObjectId if it's not already in that format
                const instructorObjectId = new mongoose_1.default.Types.ObjectId(instructorId);
                const sessions = yield sessionModel_1.SessionModel.aggregate([
                    {
                        $match: {
                            instructorId: instructorObjectId, // Filter sessions by instructorId
                            $or: [
                                { title: searchRegex },
                                { description: searchRegex },
                                { category: searchRegex }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: 'bookings', // Name of the bookings collection
                            localField: '_id',
                            foreignField: 'sessionId',
                            as: 'bookings'
                        }
                    },
                    {
                        $addFields: {
                            bookingStatus: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$bookings",
                                            as: "booking",
                                            cond: { $eq: ["$$booking.studentId", instructorObjectId] } // Filter bookings by studentId (use userId here if necessary)
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            bookings: 0, // Exclude the entire bookings array
                        }
                    },
                    { $sort: { createdAt: -1 } } // Sort by creation date
                ]);
                return sessions;
            }
            catch (error) {
                throw new Error(`Failed to perform search: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    sessionHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.find({
                    userId,
                    status: { $in: ['completed', 'cancelled'] }
                })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'instructorId',
                    select: 'firstName lastName email',
                })
                    .populate({
                    path: 'sessionId',
                    select: '_id title duration fee descriptionTitle coverImage.url',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    instructorSessionHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.find({
                    instructorId: userId,
                    status: { $in: ['completed', 'cancelled'] }
                })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'studentId',
                    select: 'firstName lastName email',
                })
                    .populate({
                    path: 'sessionId',
                    select: '_id title duration fee descriptionTitle coverImage.url',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    pendingSessions(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.find({
                    studentId,
                    status: { $in: ['booked'] }
                })
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'instructorId',
                    select: 'firstName lastName email',
                })
                    .populate({
                    path: 'sessionId',
                    select: '_id title duration fee descriptionTitle coverImage.url',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    rateInstructor(ratingData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = new ratingModel_1.RatingModel({
                    ratedBy: ratingData.ratedBy,
                    ratedUser: ratingData.ratedUser,
                    rating: ratingData.rating,
                    feedback: ratingData.feedback,
                    sessionId: ratingData.sessionId
                });
                yield response.save();
                return response;
            }
            catch (error) {
                throw new Error(`Error creating rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    findBookingAndChangeStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bookingModel_1.BookingModel.findOneAndUpdate({ _id: id }, { status: status }, { new: true });
            }
            catch (error) {
                throw new Error(`Error updating session status: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    fetchNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield notificationModel_1.NotificationModel.find({ isShown: true }).sort({ createdAt: -1 });
            }
            catch (error) {
                throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    createPost(postData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in create post repository");
                const newPost = new postModel_1.PostModel(postData);
                console.log("newPost:- ", newPost);
                return yield newPost.save();
            }
            catch (error) {
                throw new Error(`Error creating post: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    fetchPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield postModel_1.PostModel.find()
                    .sort({ createdAt: -1 })
                    .populate({
                    path: 'instructorId',
                    select: '_id firstName lastName role country image.url',
                });
            }
            catch (error) {
                throw new Error(`Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    findPostById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield postModel_1.PostModel.findById(id)
                    .populate({
                    path: 'instructorId',
                    select: '_id firstName lastName role country image.url',
                });
            }
            catch (error) {
                throw new Error(`Error finding post by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    updatePostById(id, newLikes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield postModel_1.PostModel.findByIdAndUpdate(id, { likes: newLikes }, { new: true });
            }
            catch (error) {
                throw new Error(`Error finding post by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
}
exports.UserRepository = UserRepository;
