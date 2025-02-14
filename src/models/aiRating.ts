import mongoose, { Schema, Document } from "mongoose";

// Define the IRating interface
interface IRating extends Document {
  userId: string;  // User who is giving the rating
  rating: number;  // Rating value (e.g., 1 to 5 stars)
}

// Define the schema for user chats with AI rating
const aiRatingSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,  // Reference to User model
      ref: 'User',  // Assuming there is a User model
      required: true,  // userId is mandatory
    },
    rating: {
      type: Number,  // Rating field (1 to 5 stars or any scale you choose)
      required: true,  // Rating is required
      min: 1,  // Minimum rating (1 star)
      max: 5,  // Maximum rating (5 stars)
    },
  },
  { timestamps: true }  // Automatically manage createdAt and updatedAt fields
);

// Create and export the model
const AiRatingModel = mongoose.model<IRating>("AiRating", aiRatingSchema);

export default AiRatingModel;
