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
exports.AdminRepository = void 0;
const adminModel_1 = require("../models/adminModel");
const notificationModel_1 = require("../models/notificationModel");
const userModel_1 = require("../models/userModel");
class AdminRepository {
    createAdmin(adminData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newAdmin = new adminModel_1.Admin(adminData);
                return yield newAdmin.save();
            }
            catch (error) {
                throw new Error(`Error creating admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    findAdminByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield adminModel_1.Admin.findOne({ email });
            }
            catch (error) {
                throw new Error(`Error finding admin by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    fetchUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.UserModel.find().sort({ createdAt: -1 });
            }
            catch (error) {
                throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    updateUserBlockStatus(id, isBlocked) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield userModel_1.UserModel.findByIdAndUpdate(id, { isBlocked }, { new: true }); // The { new: true } option returns the updated document
            }
            catch (error) {
                throw new Error(`Failed to update user block status: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    switchUserRole(id, newRole) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("in admin update user role repository");
                const updatedUser = yield userModel_1.UserModel.findByIdAndUpdate(id, { role: newRole, isRoleChanged: true }, { new: true }).exec();
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
    createNotification(notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = new notificationModel_1.NotificationModel(Object.assign({}, notificationData));
                yield notification.save();
                return notification;
            }
            catch (error) {
                throw new Error(`Error creating notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    updateNotification(id, notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield notificationModel_1.NotificationModel.findByIdAndUpdate(id, notificationData, { new: true });
                return notification;
            }
            catch (error) {
                throw new Error(`Error updating notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    updateNotificationStatus(id, isShown) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Fetch and update the notification
                const notification = yield notificationModel_1.NotificationModel.findByIdAndUpdate(id, { isShown: isShown }, // Correct object syntax for updating
                { new: true } // Ensures the updated document is returned
                );
                return notification;
            }
            catch (error) {
                throw new Error(`Error updating notification status: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    deleteNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield notificationModel_1.NotificationModel.findByIdAndDelete(id);
                return notification;
            }
            catch (error) {
                throw new Error(`Error deleting notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    getNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield notificationModel_1.NotificationModel.find().sort({ createdAt: -1 });
            }
            catch (error) {
                throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    getNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield notificationModel_1.NotificationModel.findById(id);
                if (!notification) {
                    return null;
                }
                return notification;
            }
            catch (error) {
                throw new Error(`Failed to fetch notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
}
exports.AdminRepository = AdminRepository;
