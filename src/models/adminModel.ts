import mongoose, { Document, ObjectId } from "mongoose";

export interface AdminDocument extends Document {
    _id: ObjectId;
    email: string;
    password: string;
}

const adminSchema = new mongoose.Schema<AdminDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
