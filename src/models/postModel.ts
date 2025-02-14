import mongoose, { Document, Schema } from "mongoose";

export interface IComment {
  userId: mongoose.Types.ObjectId;
  comment: string;
}

export interface IPost extends Document {
    instructorId: mongoose.Types.ObjectId; 
    description: string; 
    image: {
        key: string; 
        url: string; 
    };
    likes?: Map<string, boolean>; // Map for storing userId and like status
    comments?: IComment[];        // Array of comment strings
}

const postSchema: Schema<IPost> = new mongoose.Schema(
  {
    instructorId: { 
      type: mongoose.Schema.Types.ObjectId, 
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
        type: Map,  // Map for storing userId and like status
        of: Boolean,
        default: {}, // Initialize as an empty map
    },
    comments: {
      type: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",  // Reference to the User model
          required: true
        },
        comment: {
          type: String,
          required: true
        }
      }],
      default: [],
    },
  },
  { timestamps: true }
);

export const PostModel = mongoose.model<IPost>("Post", postSchema);
