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
exports.getInstructorProfile = exports.getInstructors = exports.removeFromwishlist = exports.wishlistSessions = exports.isSessionInWishlist = exports.toggleWishlist = exports.commentPost = exports.likePost = exports.getFeedPosts = exports.fetchNotifications = exports.completeSessionAndRateInstructor = exports.rateInstructor = exports.pendingSessions = exports.sessionHistory = exports.searchSessions = exports.cancelBooking = exports.bookedSessions = exports.switchUserRole = exports.createBookingAndPayment = exports.createBooking = exports.session = exports.sessions = exports.updateProfile = exports.getProfile = void 0;
const userRepoService_1 = require("../services/userRepoService");
const httpStatusCodes_1 = require("../utils/httpStatusCodes");
const s3Service_1 = require("../utils/s3Service");
const config_1 = __importDefault(require("../config/config"));
const bookingModel_1 = require("../models/bookingModel");
const mongoose_1 = __importDefault(require("mongoose"));
const stripe_1 = __importDefault(require("stripe"));
const uuid_1 = require("uuid");
const mongodb_1 = require("mongodb");
const userModel_1 = require("../models/userModel");
const postModel_1 = require("../models/postModel");
const sessionModel_1 = require("../models/sessionModel");
const userService = new userRepoService_1.UserService();
const stripe = new stripe_1.default(config_1.default.stripeSecretKey, {});
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    try {
        const user = yield userService.findUserById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        // const userData = {
        //   id:user._id,
        //   email: user.email,
        //   firstName: user.firstName,
        //   lastName: user.lastName,
        //   role: user.role,
        //   profilePicUrl: user.image?.url ? user.image?.url : null,
        //   profilePicKey: user.image?.key ? user.image?.key : null,
        //   country: user.country,
        //   education: user.education,
        //   about: user.about,
        // };
        const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicUrl: ((_a = user.image) === null || _a === void 0 ? void 0 : _a.url) ? (_b = user.image) === null || _b === void 0 ? void 0 : _b.url : null,
            profilePicKey: ((_c = user.image) === null || _c === void 0 ? void 0 : _c.key) ? (_d = user.image) === null || _d === void 0 ? void 0 : _d.key : null,
            country: user.country,
            education: user.education,
            about: user.about,
            occupation: user === null || user === void 0 ? void 0 : user.occupation,
            currentInstitution: user === null || user === void 0 ? void 0 : user.currentInstitution,
            teachingViews: user === null || user === void 0 ? void 0 : user.teachingViews,
            achievements: user === null || user === void 0 ? void 0 : user.achievements,
            experience: user === null || user === void 0 ? void 0 : user.experience
        };
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "User profile fetched successfully" }, userData));
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the profile" });
    }
});
exports.getProfile = getProfile;
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
const createBookingAndPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId, selectedDate, selectedTimeSlot, concerns, amount } = req.body;
    const { id, role } = req.userData;
    try {
        const session = yield userService.findSessionById(sessionId);
        if (!session) {
            throw new Error("Session not found");
        }
        // 🔹 Check if an existing booking exists for the same session and date
        let existingBooking = yield bookingModel_1.BookingModel.findOne({ sessionId, date: selectedDate });
        let meetingRoomId;
        if (existingBooking) {
            // 🔹 If booking exists, reuse the meetingRoomId
            console.log("already a booking exist, so reuse the meetingid");
            meetingRoomId = existingBooking.meetingRoomId;
        }
        else {
            // 🔹 If no existing booking, generate a new meetingRoomId
            console.log("no existing booking, generate a new meetingRoomId");
            meetingRoomId = (0, uuid_1.v4)();
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
        });
        console.log("00000000    paymentSession---------------0000000", paymentSession.url);
        console.log("00000000    paymentSession.id---------------0000000", paymentSession.id);
        // const meetingRoomId = uuidv4();
        const booking = yield userService.createBooking({
            studentId: new mongoose_1.default.Types.ObjectId(id),
            sessionId,
            instructorId: session.instructorId,
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            concerns,
            status: "booked",
            stripePaymentCheckoutSessionId: paymentSession.id, // Save Stripe session ID
            meetingRoomId,
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
        // const bookedSessions = await userService.bookedSessions(id)
        const bookedSessions = yield bookingModel_1.BookingModel.find({ studentId: id, status: { $in: ['booked'] } })
            .sort({ createdAt: -1 })
            .populate({
            path: 'instructorId',
            select: 'firstName lastName email image.url',
        })
            .populate({
            path: 'sessionId',
            select: '_id title duration fee descriptionTitle coverImage.url',
        });
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
        booking.status = "cancelled";
        yield booking.save();
        const checkoutSession = yield stripe.checkout.sessions.retrieve(booking.stripePaymentCheckoutSessionId);
        console.log("checkoutSession", checkoutSession);
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
const searchSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    const { id } = req.userData;
    if (!query) {
        return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Query parameter is required" });
    }
    try {
        const searchResults = yield userService.searchSessions(query, id);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Search results fetched successfully", searchResults });
    }
    catch (error) {
        console.error("Error performing search:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error performing search" });
    }
});
exports.searchSessions = searchSessions;
const sessionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("token in student payment", token);
    try {
        // const bookedSessions = await userService.sessionHistory(id)
        // console.log("Booked sessions : ", bookedSessions);
        const history = yield bookingModel_1.BookingModel.find({
            studentId: id,
            status: { $in: ['completed', "cancelled"] }
        })
            .sort({ createdAt: -1 })
            .populate({
            path: 'instructorId',
            select: 'firstName lastName email image.url',
        })
            .populate({
            path: 'sessionId',
            select: '_id title duration fee descriptionTitle coverImage.url',
        });
        console.log("session history---", history);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "Session history fetched successfully" }, history));
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching history:" });
    }
});
exports.sessionHistory = sessionHistory;
const pendingSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("token in student payment", token);
    try {
        const bookedSessions = yield userService.pendingSessions(id);
        console.log("Booked sessions : ", bookedSessions);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "pending sessions fetched successfully" }, bookedSessions));
    }
    catch (error) {
        console.error("Error fetching booked sessions:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching pending sessions:" });
    }
});
exports.pendingSessions = pendingSessions;
const rateInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("id, role", id, role);
        const { ratedUser, rating, feedback, sessionId } = req.body;
        // Validate rating options
        if (!["poor", "good", "excellent"].includes(rating)) {
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Invalid rating value." });
        }
        const ratingData = { id, ratedUser, rating, feedback, sessionId };
        const newRating = yield userService.rateInstructor(ratingData);
        console.log("newRating : ", newRating);
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "Rating submitted successfully", rating: newRating });
    }
    catch (error) {
        console.error("Error submitting rate:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error submitting rate:" });
    }
});
exports.rateInstructor = rateInstructor;
const completeSessionAndRateInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("id, role", id, role);
        const { sessionId, bookingId, rating, feedback } = req.body;
        console.log("bookingId......hh.........", bookingId);
        if (!["poor", "good", "excellent"].includes(rating)) {
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: "Invalid rating value." });
        }
        const booking = yield userService.findBookingByIdS(id, sessionId);
        if (!booking) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
        }
        const statusUpdated = yield userService.findBookingAndChangeStatus(String(booking === null || booking === void 0 ? void 0 : booking._id), 'completed');
        if (!statusUpdated) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Error updating session status" });
        }
        // If the student has provided a rating, submit the rating data
        if (rating) {
            const ratingData = {
                ratedBy: new mongodb_1.ObjectId(id),
                ratedUser: booking === null || booking === void 0 ? void 0 : booking.instructorId,
                rating,
                feedback,
                sessionId: booking.sessionId
            };
            const newRating = yield userService.rateInstructor(ratingData);
            console.log("New Rating Submitted:", newRating);
            return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({ message: "Rating submitted successfully", rating: newRating });
        }
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Session marked as completed. No rating provided." });
    }
    catch (error) {
        console.error("Error submitting rate:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error submitting rate:" });
    }
});
exports.completeSessionAndRateInstructor = completeSessionAndRateInstructor;
const fetchNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        console.log("id, role", id, role);
        const notifications = yield userService.fetchNotifications();
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Notifications fetched successfully", notifications, });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notifications:" });
    }
});
exports.fetchNotifications = fetchNotifications;
const getFeedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    console.log("id, role", id, role);
    console.log("token ", token);
    try {
        const allPosts = yield userService.fetchPosts();
        console.log("allPosts : ", allPosts);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Posts fetched successfully", posts: allPosts });
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching posts:" });
    }
});
exports.getFeedPosts = getFeedPosts;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id, role } = req.userData;
        console.log("id, role", id, role);
        const { postId } = req.params;
        const post = yield postModel_1.PostModel.findById(postId);
        if (!(post === null || post === void 0 ? void 0 : post.likes)) {
            throw new Error("Post likes are undefined");
        }
        const isLiked = (_a = post === null || post === void 0 ? void 0 : post.likes) === null || _a === void 0 ? void 0 : _a.get(id); //get - in Map, this method checks if the userId exists as a key
        if (isLiked) {
            (_b = post === null || post === void 0 ? void 0 : post.likes) === null || _b === void 0 ? void 0 : _b.delete(id); //delete - in Map, removing like(or userid) from already liked post,
        }
        else {
            (_c = post === null || post === void 0 ? void 0 : post.likes) === null || _c === void 0 ? void 0 : _c.set(id, true); //userId is the key, true is the value 
        }
        const updatedPost = yield postModel_1.PostModel.findByIdAndUpdate(postId, { likes: post.likes }, { new: true } //if do not specify this option or set it to false, Mongoose will return the og document before the update.
        );
        const updatedPostData = yield postModel_1.PostModel.findById(updatedPost === null || updatedPost === void 0 ? void 0 : updatedPost._id).populate({
            path: 'instructorId',
            select: '_id firstName lastName role country image.url',
        });
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Post updated successfully", updatedPost: updatedPostData });
    }
    catch (error) {
        console.error("Error updating likes:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating likes:" });
    }
});
exports.likePost = likePost;
const commentPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.userData;
        const { postId } = req.params;
        const { comment } = req.body;
        const post = yield postModel_1.PostModel.findById(postId);
        if (!post) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "Post not found" });
        }
        const newComment = {
            userId: new mongoose_1.default.Types.ObjectId(id),
            comment: comment,
        };
        // Add the new comment to the comments array
        (_a = post === null || post === void 0 ? void 0 : post.comments) === null || _a === void 0 ? void 0 : _a.push(newComment);
        const updatedPost = yield post.save();
        // Populate instructor details for the updated post
        const updatedPostData = yield postModel_1.PostModel.findById(updatedPost._id).populate({
            path: 'instructorId',
            select: '_id firstName lastName role country image.url',
        });
        return res.status(httpStatusCodes_1.HttpStatus.CREATED).json({
            message: "Comment added successfully",
            updatedPost: updatedPostData,
        });
    }
    catch (error) {
        console.error("Error adding comment:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Error adding comment",
        });
    }
});
exports.commentPost = commentPost;
const toggleWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, role } = req.userData;
        const { sessionId } = req.body;
        const user = yield userModel_1.UserModel.findById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        user.wishlistSessionIds = user.wishlistSessionIds || [];
        if (user.wishlistSessionIds.includes(sessionId)) {
            // Remove the sessionId from the wishlist
            user.wishlistSessionIds = user.wishlistSessionIds.filter(id => id !== sessionId);
            yield user.save();
            return res.status(200).json({ message: 'Session removed from wishlist', isInWishlist: false });
        }
        else {
            // Add the sessionId to the wishlist
            user.wishlistSessionIds.push(sessionId);
            yield user.save();
            return res.status(200).json({ message: 'Session added to wishlist', isInWishlist: true });
        }
    }
    catch (error) {
        console.error("Error updating wishlist:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the wishlist." });
    }
});
exports.toggleWishlist = toggleWishlist;
const isSessionInWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.userData;
        const { sessionId } = req.params;
        const user = yield userModel_1.UserModel.findById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        user.wishlistSessionIds = user.wishlistSessionIds || [];
        // Check if the sessionId is in the wishlist
        const isInWishlist = user.wishlistSessionIds.includes(sessionId);
        if (isInWishlist) {
            let wishlist = { sessionId: sessionId, isInWislist: true };
            return res.status(200).json({ message: 'Session is in the wishlist', wishlist: wishlist });
        }
        else {
            let wishlist = { sessionId: sessionId, isInWislist: false };
            return res.status(404).json({ message: 'Session is not in the wishlist', wishlist: wishlist });
        }
    }
    catch (error) {
        console.error("Error checking wishlist:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while checking the wishlist." });
    }
});
exports.isSessionInWishlist = isSessionInWishlist;
const wishlistSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.userData;
        const { sessionId } = req.body;
        const user = yield userModel_1.UserModel.findById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        const wishlistSessionIds = user === null || user === void 0 ? void 0 : user.wishlistSessionIds;
        const sessions = yield sessionModel_1.SessionModel.find()
            .sort({ createdAt: -1 })
            .populate({
            path: 'instructorId',
            select: 'firstName lastName',
        });
        const filteredSessions = yield Promise.all(sessions.map((session) => __awaiter(void 0, void 0, void 0, function* () {
            // Check if the session is in the user's wishlist
            if (!(wishlistSessionIds === null || wishlistSessionIds === void 0 ? void 0 : wishlistSessionIds.includes(session === null || session === void 0 ? void 0 : session._id.toString()))) {
                return null; // Skip this session if it's not in the wishlist
            }
            // Check if the session has a booking for this user
            const booking = yield bookingModel_1.BookingModel.findOne({
                sessionId: session._id,
                studentId: id,
            });
            // Only return sessions where the status is not "booked" or is "completed" or "cancelled"
            if (booking && booking.status === 'booked') {
                return null; // Skip this session if it's still booked
            }
            return session;
        })));
        const validSessions = filteredSessions.filter((session) => session !== null);
        console.log("validSessions--", validSessions);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({
            message: 'Sessions successfully fetched',
            sessions: validSessions,
        });
    }
    catch (error) {
        console.error('Error fetching wishlist:', error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'An error occurred while fetching the wishlist.',
        });
    }
});
exports.wishlistSessions = wishlistSessions;
const removeFromwishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.userData;
        const { sessionId } = req.body;
        const user = yield userModel_1.UserModel.findById(id);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }
        user.wishlistSessionIds = user.wishlistSessionIds || [];
        // Check if the sessionId is in the wishlist
        if (user.wishlistSessionIds.includes(sessionId)) {
            // Remove the sessionId from the wishlist
            user.wishlistSessionIds = user.wishlistSessionIds.filter(id => id !== sessionId);
            yield user.save();
        }
        else {
            return res.status(httpStatusCodes_1.HttpStatus.BAD_REQUEST).json({ message: 'Session not found in wishlist' });
        }
        // Fetch all the sessions in the updated wishlist
        const wishlistSessionIds = user.wishlistSessionIds;
        const sessions = yield sessionModel_1.SessionModel.find({ '_id': { $in: wishlistSessionIds } })
            .sort({ createdAt: -1 })
            .populate({
            path: 'instructorId',
            select: 'firstName lastName',
        });
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: 'Session removed and updated wishlist fetched successfully', sessions });
    }
    catch (error) {
        console.error("Error removing session and fetching wishlist:", error.message);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while processing the request." });
    }
});
exports.removeFromwishlist = removeFromwishlist;
const getInstructors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    try {
        const instructors = yield userModel_1.UserModel.aggregate([
            {
                $match: { role: "instructor" } // Ensures only instructors are fetched
            },
            {
                $lookup: {
                    from: "sessions",
                    localField: "_id",
                    foreignField: "instructorId",
                    as: "sessions",
                },
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    education: 1,
                    teachingViews: 1,
                    country: 1,
                    role: 1, // Make sure to project `role`
                    image: "$image.url",
                    sessionCount: { $size: "$sessions" }, // Count the number of sessions
                },
            },
        ]);
        return res.status(httpStatusCodes_1.HttpStatus.OK).json({ message: "Instructors data fetched successfully", instructors });
    }
    catch (error) {
        console.error("Error fetching Instructors:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching Instructors" });
    }
});
exports.getInstructors = getInstructors;
const getInstructorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let token = req.header("Authorization");
    const { id, role } = req.userData;
    const { instId } = req.params;
    try {
        const user = yield userService.findUserById(instId);
        if (!user) {
            return res.status(httpStatusCodes_1.HttpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        const profile = yield userService.findUserById(instId);
        if (!profile) {
            console.log("No details were found in the instructor profile", profile);
        }
        const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profilePicUrl: ((_a = user.image) === null || _a === void 0 ? void 0 : _a.url) ? (_b = user.image) === null || _b === void 0 ? void 0 : _b.url : null,
            profilePicKey: ((_c = user.image) === null || _c === void 0 ? void 0 : _c.key) ? (_d = user.image) === null || _d === void 0 ? void 0 : _d.key : null,
            country: user.country,
            education: user.education,
            about: user.about,
            occupation: user === null || user === void 0 ? void 0 : user.occupation,
            currentInstitution: user === null || user === void 0 ? void 0 : user.currentInstitution,
            teachingViews: user === null || user === void 0 ? void 0 : user.teachingViews,
            achievements: user === null || user === void 0 ? void 0 : user.achievements,
            experience: user === null || user === void 0 ? void 0 : user.experience
        };
        return res.status(httpStatusCodes_1.HttpStatus.OK).json(Object.assign({ message: "User profile fetched successfully" }, userData));
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(httpStatusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the profile" });
    }
});
exports.getInstructorProfile = getInstructorProfile;
