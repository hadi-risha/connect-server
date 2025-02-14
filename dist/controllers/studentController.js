"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.bookedSessions = exports.switchUserRole = exports.createBookingAndPayment = exports.createBooking = exports.getProfile = exports.updateProfile = exports.session = exports.sessions = void 0;
const userService_1 = require("../services/userService");
const s3Service_1 = require("../utils/s3Service");
const config_1 = __importDefault(require("../config/config"));
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const mongoose_1 = __importDefault(require("mongoose"));
const stripe_1 = __importDefault(require("stripe"));
const userService = new userService_1.UserService();
const stripe = new stripe_1.default(config_1.default.stripeSecretKey, {});
const sessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessions = yield userService.fetchSessions();
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Sessions successfully fetched", sessions });
    }
    catch (error) {
        console.error("Failed to fetch sessions:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch sessions", error: error.message });
    }
});
exports.sessions = sessions;
const session = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const session = yield userService.findSessionById(id);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Session successfully fetched", session });
    }
    catch (error) {
        console.error("Failed to fetch session:- ", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch session", error: error.message });
    }
});
exports.session = session;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("update profile section");
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("token in student update profile", token);
    const { firstName, lastName, about, country, education, imageStatus } = req.body;
    console.log("imageStatus..>> ", imageStatus);
    try {
        const profilePicFile = req.file;
        console.log("profilePicFile", profilePicFile);
        const imageUnchanged = imageStatus === 'unchanged';
        const deleteProfilePic = imageStatus === 'deleted';
        const updateProfilePic = imageStatus === 'updated';
        console.log("imageUnchanged : ", imageUnchanged);
        console.log("updateProfilePic : ", updateProfilePic);
        console.log("deleteProfilePic : ", deleteProfilePic);
        const existingProfile = yield userService.findUserById(id);
        if (!existingProfile) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User doesn't exist" });
        }
        console.log("image from frontend  : ", profilePicFile);
        console.log("already exist image from backend db        ", existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.image);
        // upload the profile picture to S3 if provided
        let profilePicUrl = '';
        if (profilePicFile && updateProfilePic) {
            console.log("profile pic changed");
            const { url: profilePicUrl, key: profilePicKey } = yield (0, s3Service_1.uploadImageToS3)(profilePicFile);
            existingProfile.image = {
                url: profilePicUrl,
                key: profilePicKey,
            };
            console.log("student profile uploaded in s3 : ", profilePicUrl);
            console.log("profilePicFile", profilePicFile);
        }
        else if (deleteProfilePic) {
            console.log("profile pic deleted");
            existingProfile.image = {
                url: undefined,
                key: undefined,
            };
        }
        else if (imageUnchanged) {
            console.log("profile pic not changed");
            existingProfile.image = {
                url: (_a = existingProfile.image) === null || _a === void 0 ? void 0 : _a.url,
                key: (_b = existingProfile.image) === null || _b === void 0 ? void 0 : _b.key,
            };
        }
        else {
            console.log("something went wrong in image upload", profilePicUrl);
            console.log("profilePicFile && updateProfilePic", profilePicFile, updateProfilePic);
        }
        existingProfile.firstName = firstName !== null && firstName !== void 0 ? firstName : existingProfile.firstName;
        existingProfile.lastName = lastName !== null && lastName !== void 0 ? lastName : existingProfile.lastName;
        if (about !== undefined)
            existingProfile.about = about;
        if (country !== undefined)
            existingProfile.country = country;
        if (education !== undefined)
            existingProfile.education = education;
        const updatedProfile = yield userService.updateUserDetails(existingProfile);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Profile successfully updated", profile: updatedProfile });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the profile", error: error.message });
    }
});
exports.updateProfile = updateProfile;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("token in get profile", token);
    console.log("req.userData ", req.userData);
    try {
        const user = yield userService.findUserById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        else {
            console.log("details found in user", user);
        }
        const userData = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicUrl: ((_a = user.image) === null || _a === void 0 ? void 0 : _a.url) ? (_b = user.image) === null || _b === void 0 ? void 0 : _b.url : null,
            profilePicKey: ((_c = user.image) === null || _c === void 0 ? void 0 : _c.key) ? (_d = user.image) === null || _d === void 0 ? void 0 : _d.key : null,
            country: user.country,
            education: user.education,
            about: user.about,
        };
        console.log("userData : ", userData);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "User profile fetched successfully" }, userData));
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the profile" });
    }
});
exports.getProfile = getProfile;
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.userData; //student id
    console.log("id, role", id, role);
    const { sessionId, selectedDate, selectedTimeSlot, concerns } = req.body;
    console.log("sessionId, selectedDate, selectedTimeSlot, concerns", sessionId, selectedDate, selectedTimeSlot, concerns);
    try {
        const session = yield userService.findSessionById(sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        const booking = yield userService.createBooking({
            studentId: new mongoose_1.default.Types.ObjectId(id),
            sessionId,
            instructorId: session.instructorId,
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            concerns: concerns,
            status: "booked",
        });
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json(Object.assign({ message: "Booking created successfully" }, booking));
    }
    catch (error) {
        console.error("Error creating booking:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating booking:" });
    }
});
exports.createBooking = createBooking;
// export const stripePayment = async (req: Request, res: Response): Promise<Response> => {
//   let token = req.header("Authorization"); 
//   const {id, role} = req.userData as IUserData;
//   console.log("id, role", id, role);
//   console.log("token in student payment", token);
//   const { sessionId, selectedDate, selectedTimeSlot, concerns, amount } =req.body;
//   console.log("sessionId, selectedDate, selectedTimeSlot, concerns", sessionId, selectedDate, selectedTimeSlot, concerns);
//   console.log("amount",amount);
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//           {
//             price_data: {
//                 currency: 'usd',
//                 product_data: {
//                     name: 'Session Booking', // Static product name
//                 },
//                 unit_amount: amount, // Amount in cents
//             },
//             quantity: 1,
//           },
//       ],
//       mode: 'payment',
//       success_url: `${config.frontendUrl}/student/payment-succes`, // Success page URL
//       cancel_url: `${config.frontendUrl}/student/payment-cancel`,   // Cancel page URL
//     });
//     return res.status(HttpStatus.OK).json({ message: "Payment successfull", url: session.url });
//   } catch (error) {
//     console.error("Error creating booking:", error);
//     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating booking:" });
//   }
// }
const createBookingAndPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId, selectedDate, selectedTimeSlot, concerns, amount } = req.body;
    const { id, role } = req.userData;
    try {
        const session = yield userService.findSessionById(sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        const paymentSession = yield stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Session Booking', // Static product name
                        },
                        unit_amount: amount, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${config_1.default.frontendUrl}/student/payment-success`,
            cancel_url: `${config_1.default.frontendUrl}/student/payment-cancel`,
            // success_url: `/student/payment-success`,
            // cancel_url: `/student/payment-cancel`,
        });
        console.log("00000000    paymentSession---------------0000000", paymentSession.url);
        console.log("00000000    paymentSession.id---------------0000000", paymentSession.id);
        const booking = yield userService.createBooking({
            studentId: new mongoose_1.default.Types.ObjectId(id),
            sessionId,
            instructorId: session.instructorId,
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            concerns,
            status: "booked",
            stripePaymentCheckoutSessionId: paymentSession.id, // Save Stripe session ID
        });
        console.log("booking", booking);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Booking created successfully", url: paymentSession.url });
    }
    catch (error) {
        console.error("Error during payment creation:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating booking or payment." });
    }
});
exports.createBookingAndPayment = createBookingAndPayment;
const switchUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("token in switch role", token);
    const newRole = 'instructor';
    try {
        const updatedUser = yield userService.switchUserRole(id, newRole);
        console.log("updatedUser : ", updatedUser);
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json(Object.assign({ message: "User role updated successfully" }, updatedUser));
    }
    catch (error) {
        console.error("Error updating user role:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
    }
});
exports.switchUserRole = switchUserRole;
const bookedSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("token in student payment", token);
    try {
        const bookedSessions = yield userService.bookedSessions(id);
        console.log("Booked sessions : ", bookedSessions);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Booked sessions fetched successfully" }, bookedSessions));
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching booked sessions:" });
    }
});
exports.bookedSessions = bookedSessions;
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.body;
    const { id } = req.userData;
    try {
        const booking = yield userService.findBookingById(bookingId);
        if (!booking) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
        }
        console.log("booking...", booking);
        // Cancel the booking and update the status
        booking.status = "cancelled";
        yield booking.save();
        const checkoutSession = yield stripe.checkout.sessions.retrieve(booking.stripePaymentCheckoutSessionId);
        console.log("checkoutSession", checkoutSession);
        // Refund the payment if there was a successful payment
        if (checkoutSession) {
            try {
                yield stripe.refunds.create({
                    payment_intent: checkoutSession.payment_intent,
                });
                return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Booking cancelled and payment refunded" });
            }
            catch (refundError) {
                console.error("Error processing refund:", refundError);
                return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error processing refund" });
            }
        }
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Booking cancelled" });
    }
    catch (error) {
        console.error("Error canceling booking:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error canceling booking" });
    }
});
exports.cancelBooking = cancelBooking;
