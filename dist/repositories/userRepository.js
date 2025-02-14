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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const userModel_1 = require("../models/userModel");
const sessionModel_1 = require("../models/sessionModel");
const bookingModel_1 = require("../models/bookingModel");
class UserRepository {
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in create user repository");
                const newUser = new userModel_1.UserModel(userData);
                console.log("newUser:- ", newUser);
                return yield newUser.save();
            }
            catch (error) {
                throw new Error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
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
    findUserByGoogleId(googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.UserModel.findOne({ googleId });
            }
            catch (error) {
                throw new Error(`Error finding user by Google ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
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
                    select: '_id firstName lastName image.url', // Only fetch the required fields
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
                    select: 'firstName lastName', // Only fetch the required fields
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
                return yield bookingModel_1.BookingModel.find({ studentId }) // Ensure `studentId` is passed as an object
                    .sort({ createdAt: -1 }) // Sort bookings by creation date, descending
                    .populate({
                    path: 'instructorId', // Populate instructor details
                    select: 'firstName lastName email', // Fetch only necessary fields
                })
                    .populate({
                    path: 'sessionId', // Populate session details
                    select: '_id title duration fee descriptionTitle coverImage.url', // Fetch required fields
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
                return yield bookingModel_1.BookingModel.find({ instructorId: id }) // Ensure `studentId` is passed as an object
                    .sort({ createdAt: -1 }) // Sort bookings by creation date, descending
                    .populate({
                    path: 'studentId', // Populate instructor details
                    select: '_id firstName lastName email', // Fetch only necessary fields
                })
                    .populate({
                    path: 'instructorId', // Populate instructor details
                    select: 'firstName lastName email', // Fetch only necessary fields
                })
                    .populate({
                    path: 'sessionId', // Populate session details
                    select: '_id title duration fee descriptionTitle', // Fetch required fields
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
}
exports.UserRepository = UserRepository;
