import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId; 
    sender: string; 
    readBy: string[]; 
    content: string;
    chat: string; 

    reactions?: {
        userId: string;
        type: string
    }[];
    seen?: boolean;
}

const MessageSchema: Schema = new Schema({
    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true 
        }
    ],
    content: { 
        type: String, 
        required: true 
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      trim: true,
    },

    reactions: [
        {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        type: { type: String }, // e.g., 'like', 'love', etc.
        },
    ],
    seen: { 
        type: Boolean, 
        default: false 
    },
    
}, { timestamps: true });

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
