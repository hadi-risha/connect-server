import crypto from "crypto";
import nodemailer from 'nodemailer';
import config from '../config/config';

/* RESET PSW TOKEN */
export function generateResetPasswordToken() {
  return crypto.randomBytes(32).toString("hex");
}

/* SEND FORGOT PSW EMAIL */
export const sendForgotPasswordEmail = async (email: string, resetUrl: string) => {
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: config.emailUser,
          pass: config.emailPass,
      }
  });

  let mailOptions = {
      from: config.emailUser, 
      to: email,                     
      subject: "Password Reset Request",
      text: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
      console.error('error sending forgot-psw email:', error);
      throw new Error('could not send forgot-psw reset email');
  }
};