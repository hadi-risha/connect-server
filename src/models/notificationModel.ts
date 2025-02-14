import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  isShown: { type: Boolean, default: false }, 

}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    isShown: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>("Notification", notificationSchema);
