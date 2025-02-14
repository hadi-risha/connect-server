"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const sessionSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    introduction: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    descriptionTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    timeSlots: {
        type: [String], // Array of Date objects directly
        required: true
    },
    coverImage: {
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
        required: true, // make the entire img field required
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: [
            "Science",
            "Technology",
            "Engineering",
            "Mathematics",
            "History",
            "Languages",
            "Commerce",
            "Economics",
            "Business",
            "Management",
            "IT and Software",
            "Finance",
            "Accounting",
            "Personal Development",
            "Arts",
            "Health and Wellness"
        ],
        required: false
    },
}, { timestamps: true });
exports.SessionModel = mongoose_1.default.model("Session", sessionSchema);
