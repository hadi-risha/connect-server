"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    instructorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: {
            key: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
        required: true,
    },
    likes: {
        type: Map, // Map for storing userId and like status
        of: Boolean,
        default: {}, // Initialize as an empty map
    },
    comments: {
        type: [{
                userId: {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: "User", // Reference to the User model
                    required: true
                },
                comment: {
                    type: String,
                    required: true
                }
            }],
        default: [],
    },
}, { timestamps: true });
exports.PostModel = mongoose_1.default.model("Post", postSchema);
