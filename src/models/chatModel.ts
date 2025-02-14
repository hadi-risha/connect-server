import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
    _id: string;
    users: string[];  // _id firstName lastName email image.url []
    latestMessage: string; //_id
    isGroupChat: boolean; // bool
    chatName: string;
    groupAdmin?: mongoose.Types.ObjectId;
    unreadCounts?: { userId: string; count: number }[]; 
}
  
const ChatSchema: Schema = new Schema(
    {
        users: [
            { 
            type: Schema.Types.ObjectId, 
            ref: 'User' 
            }
        ],
        latestMessage: { 
            type: Schema.Types.ObjectId, 
            ref: 'Message' 
        },
        
        isGroupChat: {
          type: Boolean,
          default: false,
        },
        chatName: {
          type: String,
          trim: true,
        },
        groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
        
        unreadCounts: [
            {
                userId: { 
                    type: Schema.Types.ObjectId, 
                    ref: 'User' 
                },
                count: { 
                    type: Number, 
                    default: 0 
                },
            },
        ],
    },
    { timestamps: true }
);
  
export const ChatModel = mongoose.model<IChat>('Chat', ChatSchema);
  