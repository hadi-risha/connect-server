"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    isShown: { type: Boolean, default: false },
}, { timestamps: true });
exports.NotificationModel = mongoose_1.default.model("Notification", notificationSchema);
