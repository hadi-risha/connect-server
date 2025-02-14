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
exports.AdminController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const adminTokenService_1 = require("../utils/adminTokenService");
const adminRepoService_1 = require("../services/adminRepoService");
const config_1 = __importDefault(require("../config/config"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const aiRating_1 = __importDefault(require("../models/aiRating"));
const chatModel_1 = require("../models/chatModel");
const userModel_1 = require("../models/userModel");
class AdminController {
    constructor() {
        this.adminService = new adminRepoService_1.AdminService();
    }
    /* ADMIN LOGGING IN */
    adminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            console.log("admin login credentialss", email, password);
            try {
                if (!email || !password) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "All fields are required" });
                }
                let admin = yield this.adminService.findAdminByEmail(email);
                if (!admin) {
                    if (config_1.default.adminEmail === email && config_1.default.adminPass === password) {
                        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                        admin = yield this.adminService.createAdmin({ email, password: hashedPassword });
                        console.log("First-time admin created successfully!");
                        const token = (0, adminTokenService_1.generateToken)(admin._id.toString());
                        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "Admin account created", token });
                    }
                    else {
                        return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Invalid credentials" });
                    }
                }
                const isMatch = yield bcryptjs_1.default.compare(password, admin.password);
                if (!isMatch) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Invalid credentials" });
                }
                const token = (0, adminTokenService_1.generateToken)(admin._id.toString());
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Admin login successful", token });
            }
            catch (error) {
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
            }
        });
    }
    /* FETCH ALL USERS */
    fetchUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { isBlocked } = req.body;
            try {
                const users = yield this.adminService.fetchUsers();
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Sessions successfully fetched", users });
            }
            catch (error) {
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch users", error: error.message });
            }
        });
    }
    /* UPDATE BLOCK STATUS */
    toggleUserBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { isBlocked } = req.body;
            if (typeof isBlocked !== 'boolean') {
                return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Invalid block status. Expected a boolean value.' });
            }
            try {
                const user = yield this.adminService.updateUserBlockStatus(id, isBlocked);
                if (!user) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found.' });
                }
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "User block status updated successfully.", user });
            }
            catch (error) {
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to update block status", error: error.message });
            }
        });
    }
    switchUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, newRole } = req.body;
            try {
                const updatedUser = this.adminService.switchUserRole(id, newRole);
                console.log("updatedUser-----------", updatedUser);
                if (!updatedUser) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found.' });
                }
                return res.status(httpStatusCodes_1.HttpStatus.CREATED).json(Object.assign({ message: "User role updated successfully" }, updatedUser));
            }
            catch (error) {
                console.error("Error updating user role:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
            }
        });
    }
    createNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, message, } = req.body;
                const notificationData = { title, message };
                const newNotification = yield this.adminService.createNotification(notificationData);
                return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "Notification created successfully", newNotification, });
            }
            catch (error) {
                console.error("Error creating notification:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating notification:" });
            }
        });
    }
    updateNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { title, message } = req.body;
                const notificationData = { title, message };
                const updatedNotification = yield this.adminService.updateNotification(id, notificationData);
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Notification updated successfully", updatedNotification, });
            }
            catch (error) {
                console.error("Error updating user role:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating notification:" });
            }
        });
    }
    updateNotificationStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { isShown } = req.body;
                const updatedNotification = yield this.adminService.updateNotificationStatus(id, isShown);
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Notification updated successfully", updatedNotification, });
            }
            catch (error) {
                console.error("Error updating user role:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating notification:" });
            }
        });
    }
    deleteNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deleted = yield this.adminService.deleteNotification(id);
                if (!deleted) {
                    // If no notification was found and deleted
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Notification not found" });
                }
                return res.status(httpStatusCodes_1.HttpStatus.NO_CONTENT).json({ message: "Notification deleted successfully" });
            }
            catch (error) {
                console.error("Error updating user role:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error deleting notification:" });
            }
        });
    }
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notifications = yield this.adminService.getNotifications();
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Notifications fetched successfully", notifications, });
            }
            catch (error) {
                console.error("Error fetching notifications:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notifications:" });
            }
        });
    }
    getNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const notification = yield this.adminService.getNotification(id);
                if (!notification) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Notification not found" });
                }
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Notification fetched successfully", notification, });
            }
            catch (error) {
                console.error("Error fetching notification:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notification:" });
            }
        });
    }
    getAiRatings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch all AI ratings in descending order of `createdAt`
                const aiRatings = yield aiRating_1.default.find().populate("userId", "firstName lastName email role image.url").sort({ createdAt: -1 });
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "AI Ratings fetched successfully", aiRatings, });
            }
            catch (error) {
                console.error("Error fetching AI ratings:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching AI ratings", });
            }
        });
    }
    getCommunities(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch all group chats and populate admin + user details
                const communityChats = yield chatModel_1.ChatModel.find({ isGroupChat: true })
                    .populate("groupAdmin", "_id firstName lastName email image.url") // Fetch admin details
                    .populate("users", "_id firstName lastName email image.url") // Fetch all users' details
                    .sort({ createdAt: -1 });
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({
                    message: "Community chats fetched successfully",
                    communityChats,
                });
            }
            catch (error) {
                console.error("Error fetching community chats:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Error fetching community chats",
                });
            }
        });
    }
    deleteCommunity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { groupId } = req.params;
                // Find and delete the group
                const deletedCommunity = yield chatModel_1.ChatModel.findByIdAndDelete(groupId);
                if (!deletedCommunity) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({
                        message: "Community not found",
                    });
                }
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({
                    message: "Community deleted successfully",
                });
            }
            catch (error) {
                console.error("Error deleting community:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Error deleting community",
                });
            }
        });
    }
    removeUserFromCommunity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { groupId, userId } = req.params;
                // Find the group chat
                const community = yield chatModel_1.ChatModel.findById(groupId);
                if (!community) {
                    return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({
                        message: "Community not found",
                    });
                }
                // Check if the user is part of the group
                if (!community.users.includes(userId)) {
                    return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({
                        message: "User is not a member of this community",
                    });
                }
                // Remove the user from the users array
                community.users = community.users.filter((id) => id.toString() !== userId);
                yield community.save();
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({
                    message: "User removed from community successfully",
                });
            }
            catch (error) {
                console.error("Error removing user from community:", error);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Error removing user from community",
                });
            }
        });
    }
    dashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalUsers = yield userModel_1.UserModel.countDocuments();
                const instructors = yield userModel_1.UserModel.countDocuments({ role: "instructor" });
                const students = yield userModel_1.UserModel.countDocuments({ role: "student" });
                const blockedUsers = yield userModel_1.UserModel.countDocuments({ isBlocked: true });
                const dashboard = {
                    totalUsers, instructors, students, blockedUsers,
                };
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({
                    message: "dashboard fetched successfully", dashboard
                });
            }
            catch (error) {
                console.error("Error fetching dashboard stats:", error);
                return res.status(500).json({
                    message: "Internal Server Error",
                });
            }
        });
    }
}
exports.AdminController = AdminController;
;
