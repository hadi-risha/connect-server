import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  googleId?:string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: "student" | "instructor";
  isVerified: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;

  about?: string;
  country?: string;
  occupation?: string;
  currentInstitution?: string;
  teachingViews?: string ;
  achievements?: string;
  education?: string;
  experience?: string;  

  image?: {
    key?: string | '';
    url?: string | '';
  };

  isBlocked: boolean;
  isRoleChanged: boolean;

  lastActive?: Date;

  wishlistSessionIds?: string[];
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  googleId: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,   

  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],   
    default: "student",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: null,
    required: false,
  },
  resetPasswordExpiry: {
    type: Date,
    default: null,
    required: false,
  },
  about: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  occupation: {
    type: String,
    required: false,
  },
  currentInstitution: {
    type: String,
    required: false,
  },
  teachingViews: {
    type: String,
    required: false,
  },
  achievements: {
    type: String,
    required: false,
  },
  education: {
    type: String,
    required: false,
  },
  experience: {
    type: String,
    required: false,
  },
  image: {
    type: {
      key: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: true,
      },
    },
    required: false, // make the entire img field optional
  },
  isBlocked: { 
    type: Boolean, 
    default: false 
  },
  isRoleChanged: { 
    type: Boolean, 
    default: false 
  },
  lastActive: {
    type: Date, 
    default: Date.now 
  },

  wishlistSessionIds: {
    type: [String], // This will be an array of strings
    default: [], // Initialize as an empty array by default
  },

} ,{timestamps:true});

export const UserModel = mongoose.model<IUser>("User", userSchema);