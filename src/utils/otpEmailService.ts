import nodemailer from 'nodemailer';
import config from '../config/config';

export const sendOtpEmail = async (email: string, otp: string) => {
    console.log("sendOtpEmail section");    
    
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
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}` 
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully');
    } catch (error) {
        console.error('error sending OTP email:', error);
        throw new Error('could not send OTP email');
    }
};

