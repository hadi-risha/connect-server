import { IUser, IUserRepository } from '../interfaces/userRepoInterface';
import { UserModel } from '../models/userModel';
import { ISession, SessionModel } from '../models/sessionModel';
import { BookingModel, IBooking } from '../models/bookingModel';
import mongoose from 'mongoose';
import { IRating, RatingModel } from '../models/ratingModel';
import { INotification, NotificationModel } from '../models/notificationModel';
import { ChatModel, IChat } from '../models/chatModel';
import { IMessage, MessageModel } from '../models/messageModel';
import { IPost, PostModel } from '../models/postModel';






export class UserRepository implements IUserRepository {

    // ***
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        try {
            const newUser = new UserModel(userData); 
            return await newUser.save();  
        } catch (error) {
            throw new Error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // ***
    async findUserByEmail(email: string): Promise<IUser | null> {
        try {
            return await UserModel.findOne({ email });
        } catch (error) {
            throw new Error(`Error finding user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // ***
    async findUserById(id: string): Promise<IUser | null> {
        try {
            return await UserModel.findById(id);
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // ***
    async updateUserVerification(email: string): Promise<IUser | null> {
        try {
            return await UserModel.findOneAndUpdate(
                { email },
                { isVerified: true },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating user verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // ***
    async findUserByResetToken(token: string): Promise<IUser | null> {
        try {
            const user = await UserModel.findOne({ resetPasswordToken: token });
            if (user) {
                if (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date()) {
                    // Token expired
                    user.resetPasswordToken = null;
                    user.resetPasswordExpiry = null;
                    await user.save(); 
                    return null; 
                }
                return user; 
            }
            return null; 
        } catch (error) {
            throw new Error(`Error finding user by reset token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // async findUserByGoogleId(googleId: string): Promise<IUser | null> {
    //     try {
    //         return await UserModel.findOne({ googleId });
    //     } catch (error) {
    //         throw new Error(`Error finding user by Google ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    //     }
    // }

    

    async updateUserDetails(profileData: IUser): Promise<IUser> {
        try {
            console.log("in update profile repository");
            const updatedProfile = await UserModel.findByIdAndUpdate(profileData._id, profileData, { new: true }).exec();
        
            if (!updatedProfile) {
                console.log("Profile not found");
                throw new Error("Profile not found");
            }
        
            return updatedProfile;
        } catch (error) {
            throw new Error(`Error updating user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async createSession(sessionData: Partial<ISession>): Promise<ISession> {
        try {
            console.log("in create user repository");
            
            const newSession = new SessionModel(sessionData); 
            console.log("newSession:- ", newSession);
            
            return await newSession.save();  
        } catch (error) {
            throw new Error(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }





    async findSessionById(id: string): Promise<ISession | null> {
        try {
            return await SessionModel.findById(id)
            .populate({
                path: 'instructorId',
                select: '_id firstName lastName image.url', 
            });
        } catch (error) {
            throw new Error(`Error finding session by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }




    


    async updateSessionDetails(sessionData: ISession): Promise<ISession> {
        try {
            console.log("in update session data repository");
            const updatedSession = await SessionModel.findByIdAndUpdate(sessionData._id, sessionData, { new: true }).exec();
        
            if (!updatedSession) {
                console.log("Session not found");
                throw new Error("Session not found");
            }
            return updatedSession;
        } catch (error) {
            throw new Error(`Error updating user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    

    async deleteSessionById(id: string): Promise<boolean> {
        const deletedSession = await SessionModel.findByIdAndDelete(id);
        return !!deletedSession; // Returns true if a session was deleted, otherwise false
    }




    async createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
        try {
            console.log("in create booking repository");
            
            const newBooking = new BookingModel(bookingData); 
            console.log("newBooking:- ", newBooking);
            
            return await newBooking.save();  
        } catch (error) {
            throw new Error(`Error creating booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    async fetchSessions(): Promise<ISession[] | null> {
        try {
            return await SessionModel.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'instructorId',
                select: 'firstName lastName', 
            });
        } catch (error) {
            throw new Error(`Failed to fetch sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async switchUserRole(id: string, newRole: string): Promise<IUser> {
        try {
            console.log("in update user role repository");
            const updatedUser = await UserModel.findByIdAndUpdate(id, { role: newRole },{ new: true }).exec();
        
            if (!updatedUser) {
                console.log("User not found");
                throw new Error("User not found");
            }
            return updatedUser;
        } catch (error) {
            throw new Error(`Error updating user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async bookedSessions(studentId: string): Promise<IBooking[] | null> {
        try {
            return await BookingModel.find({ studentId }) 
            .sort({ createdAt: -1 }) 
            .populate({
                path: 'instructorId', 
                select: 'firstName lastName email', 
            })
            .populate({
                path: 'sessionId', 
                select: '_id title duration fee descriptionTitle coverImage.url', 
            });

        } catch (error) {
            throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    


    async instructorBookedSessions(id: string): Promise<IBooking[] | null> {
        try {
            return await BookingModel.find({ instructorId: id }) 
            .sort({ createdAt: -1 }) 
            .populate({
                path: 'studentId', 
                select: '_id firstName lastName email image.url', 
            })
            .populate({
                path: 'instructorId', 
                select: 'firstName lastName email', 
            })
            .populate({
                path: 'sessionId', 
                select: '_id title duration fee descriptionTitle coverImage.url', 
            });

        } catch (error) {
            throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async instructorAvailableSessions(id: string): Promise<ISession[] | null> {
        try {
            return await SessionModel.find({ instructorId:id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'instructorId',
                select: '_id firstName lastName email',
            });

        } catch (error) {
            throw new Error(`Failed to fetch sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async updateIsRoleChanged(id: string): Promise<IUser | null> {
        try {
            return await UserModel.findOneAndUpdate(
                { _id: id },
                { isRoleChanged: false },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating user verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async findBookingById(id: string): Promise<IBooking | null> {
        try {
            return await BookingModel.findById(id)
        } catch (error) {
            throw new Error(`Error finding booking by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async findBookingByIdS(studentId: string, sessionId: string): Promise<IBooking | null> {
        try {
            return await BookingModel.findOne({ studentId, sessionId });
        } catch (error) {
            throw new Error(
                `Error finding booking by IDs: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }


    async searchSessions(query: string, userId: string): Promise<any[]> {
        try {
            const searchRegex = new RegExp(query, 'i'); // Case-insensitive regex for partial matches
    
            const sessions = await SessionModel.aggregate([
                { 
                    $match: { 
                        $or: [
                            { title: searchRegex },
                            { description: searchRegex },
                            { category: searchRegex }
                        ] 
                    } 
                },
                {
                    $lookup: {
                        from: 'bookings', // Name of the bookings collection
                        localField: '_id',
                        foreignField: 'sessionId',
                        as: 'bookings'
                    }
                },
                {
                    $addFields: {
                        bookingStatus: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$bookings",
                                        as: "booking",
                                        cond: { $eq: ["$$booking.studentId", new mongoose.Types.ObjectId(userId)] }
                                    }
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $project: {
                        bookings: 0, // Exclude the entire bookings array
                    }
                },
                { $sort: { createdAt: -1 } } // Sort by creation date
            ]);
    
            return sessions;
        } catch (error) {
            throw new Error(`Failed to perform search: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    async instructorSearchSessions(query: string, instructorId: string): Promise<any[]> {
        try {
            const searchRegex = new RegExp(query, 'i'); // Case-insensitive regex for partial matches
    
            // Convert instructorId to mongoose.Types.ObjectId if it's not already in that format
            const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    
            const sessions = await SessionModel.aggregate([
                { 
                    $match: { 
                        instructorId: instructorObjectId, // Filter sessions by instructorId
                        $or: [
                            { title: searchRegex },
                            { description: searchRegex },
                            { category: searchRegex }
                        ] 
                    } 
                },
                {
                    $lookup: {
                        from: 'bookings', // Name of the bookings collection
                        localField: '_id',
                        foreignField: 'sessionId',
                        as: 'bookings'
                    }
                },
                {
                    $addFields: {
                        bookingStatus: {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$bookings",
                                        as: "booking",
                                        cond: { $eq: ["$$booking.studentId", instructorObjectId] } // Filter bookings by studentId (use userId here if necessary)
                                    }
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $project: {
                        bookings: 0, // Exclude the entire bookings array
                    }
                },
                { $sort: { createdAt: -1 } } // Sort by creation date
            ]);
    
            return sessions;
        } catch (error) {
            throw new Error(`Failed to perform search: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    


    async sessionHistory(userId: string): Promise<IBooking[] | null> {
        try {
            return await BookingModel.find({ 
                userId, 
                status: { $in: ['completed', 'cancelled'] }  
            })
            .sort({ createdAt: -1 }) 
            .populate({
                path: 'instructorId', 
                select: 'firstName lastName email', 
            })
            .populate({
                path: 'sessionId', 
                select: '_id title duration fee descriptionTitle coverImage.url', 
            });
        } catch (error) {
            throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }    
    }

    async instructorSessionHistory(userId: string): Promise<IBooking[] | null> {
        try {
            return await BookingModel.find({ 
                instructorId: userId, 
                status: { $in: ['completed', 'cancelled'] }  
            })
            .sort({ createdAt: -1 }) 
            .populate({
                path: 'studentId', 
                select: 'firstName lastName email', 
            })
            .populate({
                path: 'sessionId', 
                select: '_id title duration fee descriptionTitle coverImage.url', 
            });
        } catch (error) {
            throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }    
    }



    async pendingSessions(studentId: string): Promise<IBooking[] | null> {
        try {
            return await BookingModel.find({ 
                studentId,
                status: { $in: ['booked'] } 
             }) 
            .sort({ createdAt: -1 }) 
            .populate({
                path: 'instructorId', 
                select: 'firstName lastName email', 
            })
            .populate({
                path: 'sessionId', 
                select: '_id title duration fee descriptionTitle coverImage.url', 
            });

        } catch (error) {
            throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    async rateInstructor( ratingData: Partial<IRating> ): Promise<IRating | null> {
        try {
            const response = new RatingModel({
                ratedBy: ratingData.ratedBy, 
                ratedUser: ratingData.ratedUser,
                rating: ratingData.rating,
                feedback: ratingData.feedback,
                sessionId: ratingData.sessionId
            });

            await response.save();
            return response;
        } catch (error) {
            throw new Error(`Error creating rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    async findBookingAndChangeStatus( id: string, status : string ): Promise<IBooking | null> {
        
        try {
            return await BookingModel.findOneAndUpdate(
                { _id: id },
                { status: status },
                { new: true }
            );
        } catch (error) {
            throw new Error(`Error updating session status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    async fetchNotifications(): Promise<INotification[] | null> {
        try {
            return await NotificationModel.find({ isShown: true }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }




    async createPost(postData: Partial<IPost>): Promise<IPost | null> {
        try {
            console.log("in create post repository");
            
            const newPost = new PostModel(postData); 
            console.log("newPost:- ", newPost);
            
            return await newPost.save();  
        } catch (error) {
            throw new Error(`Error creating post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }




    async fetchPosts(): Promise<IPost[] | null> {
        try {
            return await PostModel.find()
            .sort({ createdAt: -1 })
            .populate({
                path: 'instructorId',
                select: '_id firstName lastName role country image.url', 
            });
        } catch (error) {
            throw new Error(`Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async findPostById(id: string): Promise<IPost | null> {
        try {
            return await PostModel.findById(id)
            .populate({
                path: 'instructorId',
                select: '_id firstName lastName role country image.url',
            });
        } catch (error) {
            throw new Error(`Error finding post by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }



    async updatePostById(id: string, newLikes: Record<string, boolean>): Promise<IPost | null> {
        try {
            return await PostModel.findByIdAndUpdate(
                id,
                {likes: newLikes}, 
                { new: true }  
            ); 
        } catch (error) {
            throw new Error(`Error finding post by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }




}
