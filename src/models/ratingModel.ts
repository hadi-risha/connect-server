import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  ratedBy: mongoose.Types.ObjectId; 
  ratedUser: mongoose.Types.ObjectId; 
  rating: "poor" | "good" | "excellent"; 
  feedback?: string; 
  sessionId: mongoose.Types.ObjectId; 
}

const ratingSchema: Schema<IRating> = new mongoose.Schema(
  {
    ratedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    ratedUser: { 
      type: mongoose.Schema.Types.ObjectId, 
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
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Session", 
      required: true 
    }, 
  },
  { timestamps: true }
);

export const RatingModel = mongoose.model<IRating>("Rating", ratingSchema);
