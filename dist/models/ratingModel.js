"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatingModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ratingSchema = new mongoose_1.default.Schema({
    ratedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ratedUser: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: String,
        enum: ["poor", "good", "excellent"],
        required: false
    },
    feedback: {
        type: String,
        required: false
    },
    sessionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Session",
        required: true
    },
}, { timestamps: true });
exports.RatingModel = mongoose_1.default.model("Rating", ratingSchema);
