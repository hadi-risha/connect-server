import crypto from 'crypto';

const otpStore: { [key: string]: string } = {}; 
console.log("otpStore", otpStore);

export const generateOtp = (email: string): string => {
    const otp = crypto.randomInt(100000, 999999).toString(); 
    otpStore[email] = otp; 
    setTimeout(() => delete otpStore[email], 2 * 60 * 1000);  //expires after 2 minutes
    return otp;
};

export const verifyOtp = (email: string, otp: string): boolean => {
    if (otpStore[email] === otp) {
        delete otpStore[email];
        return true;
    }
    return false;
};
