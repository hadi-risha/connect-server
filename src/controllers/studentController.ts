import { Request, Response } from 'express';
import { UserService } from '../services/userRepoService';
import { HttpStatus } from '../utils/httpStatusCodes';

import { uploadImageToS3 } from '../utils/s3Service';
import config from '../config/config'
import { BookingModel, IBooking } from '../models/bookingModel';
import mongoose from "mongoose"; 
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs'; 
import { ObjectId } from 'mongodb';
import { ChatModel, IChat } from '../models/chatModel';
import { UserModel } from '../models/userModel';
import { MessageModel } from '../models/messageModel';
import { AiChatModel } from '../models/aiChat';
import { AiUserChatsModel } from '../models/aiUserChats';
import { PostModel } from '../models/postModel';
import { SessionModel } from '../models/sessionModel';


const userService = new UserService();
const stripe = new Stripe(config.stripeSecretKey as string, {});


interface IUserData {
  id: string;
  role: string;
}

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;

  try {
    const user = await userService.findUserById(id);
    if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
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
        id:user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicUrl: user.image?.url ? user.image?.url : null,
        profilePicKey: user.image?.key ? user.image?.key : null,
        country: user.country,
        education: user.education,
        about: user.about,
        occupation: user?.occupation,
        currentInstitution: user?.currentInstitution,
        teachingViews: user?.teachingViews,
        achievements: user?.achievements,
        experience: user?.experience
      };
  
    return res.status(HttpStatus.OK).json({ message: "User profile fetched successfully", ...userData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the profile" });
  }
};


export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  console.log("update profile section");

  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;
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

    const existingProfile = await userService.findUserById(id);
    if (!existingProfile) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "User doesn't exist" });
    }

    console.log("image from frontend  : ", profilePicFile);
    console.log("already exist image from backend db        " , existingProfile?.image);

    // upload the profile picture to S3 if provided
    let profilePicUrl = '';
    if (profilePicFile && updateProfilePic) {
      console.log("profile pic changed");
      const { url: profilePicUrl, key: profilePicKey } = await uploadImageToS3(profilePicFile);
      existingProfile.image = {
        url: profilePicUrl,
        key: profilePicKey,
      };
      console.log("student profile uploaded in s3 : ", profilePicUrl);
      console.log("profilePicFile", profilePicFile );
    } else if (deleteProfilePic) {
      console.log("profile pic deleted");
        existingProfile.image = {
          url: undefined,
          key: undefined,
        };
    } else if (imageUnchanged) {
      console.log("profile pic not changed");
        existingProfile.image = {
          url: existingProfile.image?.url,
          key: existingProfile.image?.key,
        };
    }else{
      console.log("something went wrong in image upload", profilePicUrl);
      console.log("profilePicFile && updateProfilePic", profilePicFile , updateProfilePic);
    }
      
    existingProfile.firstName = firstName ?? existingProfile.firstName;
    existingProfile.lastName = lastName ?? existingProfile.lastName;
    if (about !== undefined) existingProfile.about = about;
    if (country !== undefined) existingProfile.country = country;
    if (education !== undefined) existingProfile.education = education;

    const updatedProfile = await userService.updateUserDetails(existingProfile);
    return res.status(HttpStatus.OK).json({ message: "Profile successfully updated", profile: updatedProfile });
  } catch (error:any) {
    console.error("Error updating profile:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the profile",error: error.message});
  }
};


export const sessions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const sessions = await userService.fetchSessions();
    return res.status(HttpStatus.OK).json({ message: "Sessions successfully fetched", sessions });
  } catch (error:any) {
    console.error("Failed to fetch sessions:- ", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch sessions",error: error.message});
  }
};


export const session = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  try {
    const session = await userService.findSessionById(id);
    return res.status(HttpStatus.OK).json({ message: "Session successfully fetched", session });
  } catch (error:any) {
    console.error("Failed to fetch session:- ", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch session",error: error.message});
  }
};



export const createBooking = async (req: Request, res: Response): Promise<Response> => {
  const {id, role} = req.userData as IUserData;  //student id
  console.log("id, role", id, role);

  const { sessionId, selectedDate, selectedTimeSlot, concerns} =req.body;
  console.log("sessionId, selectedDate, selectedTimeSlot, concerns", sessionId, selectedDate, selectedTimeSlot, concerns);
  try {
    const session = await userService.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const booking = await userService.createBooking({
      studentId:new mongoose.Types.ObjectId(id),
      sessionId,
      instructorId : session.instructorId,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      concerns: concerns,
      status: "booked",
    } as Partial<IBooking>);

    return res.status(HttpStatus.CREATED).json({ message: "Booking created successfully", ...booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating booking:" });
  }
}


export const createBookingAndPayment = async (req: Request, res: Response): Promise<Response> => {
  const { sessionId, selectedDate, selectedTimeSlot, concerns, amount } = req.body;
  const { id, role } = req.userData as IUserData;
  
  try {
    const session = await userService.findSessionById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

     // 🔹 Check if an existing booking exists for the same session and date
    let existingBooking = await BookingModel.findOne({ sessionId, date: selectedDate });
    let meetingRoomId;
    if (existingBooking) {
      // 🔹 If booking exists, reuse the meetingRoomId
      console.log("already a booking exist, so reuse the meetingid");
      
      meetingRoomId = existingBooking.meetingRoomId;
    } else {
      // 🔹 If no existing booking, generate a new meetingRoomId
      console.log("no existing booking, generate a new meetingRoomId");
      meetingRoomId = uuidv4();
    }

    const paymentSession = await stripe.checkout.sessions.create({
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
      success_url: `${config.frontendUrl}/student/payment-success`,
      cancel_url: `${config.frontendUrl}/student/payment-cancel`,
    });

    console.log("00000000    paymentSession---------------0000000", paymentSession.url);
    console.log("00000000    paymentSession.id---------------0000000", paymentSession.id);

    // const meetingRoomId = uuidv4();
    
    const booking = await userService.createBooking({
      studentId: new mongoose.Types.ObjectId(id),
      sessionId,
      instructorId: session.instructorId,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      concerns,
      status: "booked",
      stripePaymentCheckoutSessionId: paymentSession.id, // Save Stripe session ID
      meetingRoomId,
    } as Partial<IBooking>);

    console.log("booking", booking);


    return res.status(HttpStatus.OK).json({ message: "Booking created successfully", url: paymentSession.url });
  } catch (error) {
    console.error("Error during payment creation:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error creating booking or payment." });
  }
}


export const switchUserRole = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;
  console.log("id, role", id, role);
  console.log("token in switch role", token);

  const newRole = 'instructor'
  try {
    const updatedUser = await userService.switchUserRole(id, newRole)
    console.log("updatedUser : ", updatedUser);
    
    return res.status(HttpStatus.CREATED).json({ message: "User role updated successfully", ...updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
  }
}

export const bookedSessions = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;
  console.log("id, role", id, role);
  console.log("token in student payment", token);
  try {
    // const bookedSessions = await userService.bookedSessions(id)

    const bookedSessions = await BookingModel.find({ studentId: id , status: { $in: ['booked'] }  }) 
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
    
    return res.status(HttpStatus.OK).json({ message: "Booked sessions fetched successfully", ...bookedSessions });
  } catch (error) {
    console.error("Error fetching booked sessions:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching booked sessions:" });
  }
}


export const cancelBooking = async (req: Request, res: Response): Promise<Response> => {
  const { bookingId } = req.body;
  const { id } = req.userData as IUserData;

  try {
    const booking = await userService.findBookingById(bookingId);
    if (!booking) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
    }

    console.log("booking...", booking);
    
    booking.status = "cancelled";
    await booking.save();

    const checkoutSession = await stripe.checkout.sessions.retrieve( booking.stripePaymentCheckoutSessionId );
    console.log("checkoutSession", checkoutSession);
    
    if ( checkoutSession ) {
      try {

        await stripe.refunds.create({

          payment_intent: checkoutSession.payment_intent as string,
        });
        return res.status(HttpStatus.OK).json({ message: "Booking cancelled and payment refunded" });
      } catch (refundError) {
        console.error("Error processing refund:", refundError);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error processing refund" });
      }
    }

    return res.status(HttpStatus.OK).json({ message: "Booking cancelled" });

  } catch (error) {
    console.error("Error canceling booking:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error canceling booking" });
  }
}


export const searchSessions = async (req: Request, res: Response): Promise<Response> => {
  const { query } = req.query as { query?: string }; 
  const { id } = req.userData as IUserData;

  if (!query) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Query parameter is required" });
  }

  try {
    const searchResults = await userService.searchSessions(query, id);
    return res.status(HttpStatus.OK).json({ message: "Search results fetched successfully",  searchResults });

  } catch (error) {
    console.error("Error performing search:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error performing search" });
  }
}


export const sessionHistory = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;
  console.log("id, role", id, role);
  console.log("token in student payment", token);
  try {
    // const bookedSessions = await userService.sessionHistory(id)
    // console.log("Booked sessions : ", bookedSessions);

    const history = await BookingModel.find({ 
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
            
    
    return res.status(HttpStatus.OK).json({ message: "Session history fetched successfully", ...history });
  } catch (error) {
    console.error("Error fetching booked sessions:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching history:" });
  }
}



export const pendingSessions = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;
  console.log("id, role", id, role);
  console.log("token in student payment", token);
  try {
    const bookedSessions = await userService.pendingSessions(id)
    
    console.log("Booked sessions : ", bookedSessions);
    
    return res.status(HttpStatus.OK).json({ message: "pending sessions fetched successfully", ...bookedSessions });
  } catch (error) {
    console.error("Error fetching booked sessions:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching pending sessions:" });
  }
}


export const rateInstructor = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id, role} = req.userData as IUserData;
    console.log("id, role", id, role);

    const { ratedUser, rating, feedback, sessionId } = req.body;

    // Validate rating options
    if (!["poor", "good", "excellent"].includes(rating)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid rating value." });
    }

    const ratingData = { id, ratedUser, rating, feedback, sessionId }

    const newRating = await userService.rateInstructor(ratingData)
    console.log("newRating : ", newRating);
    
    return res.status(HttpStatus.CREATED).json({ message: "Rating submitted successfully", rating: newRating });
  } catch (error) {
    console.error("Error submitting rate:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error submitting rate:" });
  }
}





export const completeSessionAndRateInstructor = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id, role} = req.userData as IUserData;
    console.log("id, role", id, role);


    const { sessionId, bookingId, rating, feedback } = req.body;
    console.log("bookingId......hh.........", bookingId);
    
    if (!["poor", "good", "excellent"].includes(rating)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "Invalid rating value." });
    }

    const booking = await userService.findBookingByIdS(id, sessionId);
    if (!booking) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
    }
    
    const statusUpdated = await userService.findBookingAndChangeStatus(String(booking?._id), 'completed');
    if (!statusUpdated) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Error updating session status" });
    }

    // If the student has provided a rating, submit the rating data
    if (rating) {
      const ratingData = {
        ratedBy: new ObjectId(id), 
        ratedUser: booking?.instructorId, 
        rating,
        feedback,
        sessionId: booking.sessionId
      };
      const newRating = await userService.rateInstructor(ratingData);

      console.log("New Rating Submitted:", newRating);

      return res.status(HttpStatus.CREATED).json({ message: "Rating submitted successfully", rating: newRating });
    }


    return res.status(HttpStatus.OK).json({ message: "Session marked as completed. No rating provided." });
  } catch (error) {
    console.error("Error submitting rate:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error submitting rate:" });
  }
}

export const fetchNotifications = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id, role} = req.userData as IUserData;
    console.log("id, role", id, role);
    const notifications = await userService.fetchNotifications();
    return res.status(HttpStatus.OK).json({ message: "Notifications fetched successfully", notifications,});
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notifications:" });
  }
}




export const getFeedPosts = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;
  console.log("id, role", id, role);
  console.log("token ", token);
  try {
    const allPosts = await userService.fetchPosts()
    console.log("allPosts : ", allPosts);
    
    return res.status(HttpStatus.OK).json({ message: "Posts fetched successfully", posts: allPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching posts:" });
  }
}


export const likePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id, role} = req.userData as IUserData;
    console.log("id, role", id, role);

    const { postId } = req.params;

    const post = await PostModel.findById(postId);

    if (!post?.likes) {
      throw new Error("Post likes are undefined");
    }

    const isLiked = post?.likes?.get(id);  //get - in Map, this method checks if the userId exists as a key
    if (isLiked) {
        post?.likes?.delete(id); //delete - in Map, removing like(or userid) from already liked post,
    }else{
        post?.likes?.set(id, true);  //userId is the key, true is the value 
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        {likes: post.likes}, 
        { new: true }  //if do not specify this option or set it to false, Mongoose will return the og document before the update.
    ); 

    const updatedPostData = await PostModel.findById(updatedPost?._id).populate({
      path: 'instructorId',
      select: '_id firstName lastName role country image.url',
    });

    return res.status(HttpStatus.OK).json({ message: "Post updated successfully", updatedPost: updatedPostData });
  } catch (error) {
    console.error("Error updating likes:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating likes:" });
  }
}



export const commentPost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.userData as IUserData;
    const { postId } = req.params; 
    const { comment } = req.body; 

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Post not found" });
    }

    const newComment = {
      userId: new mongoose.Types.ObjectId(id),
      comment: comment,
    };
    
    // Add the new comment to the comments array
    post?.comments?.push(newComment);

    const updatedPost = await post.save();

    // Populate instructor details for the updated post
    const updatedPostData = await PostModel.findById(updatedPost._id).populate({
      path: 'instructorId',
      select: '_id firstName lastName role country image.url',
    });

    return res.status(HttpStatus.CREATED).json({
      message: "Comment added successfully",
      updatedPost: updatedPostData,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Error adding comment",
    });
  }
};





export const toggleWishlist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;
    const { sessionId } = req.body;

    const user = await UserModel.findById(id); 

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    user.wishlistSessionIds = user.wishlistSessionIds || [];

    if (user.wishlistSessionIds.includes(sessionId)) {
      // Remove the sessionId from the wishlist
      user.wishlistSessionIds = user.wishlistSessionIds.filter(id => id !== sessionId);
      await user.save();
      return res.status(200).json({ message: 'Session removed from wishlist', isInWishlist: false });
    } else {
      // Add the sessionId to the wishlist
      user.wishlistSessionIds.push(sessionId);
      await user.save();
      return res.status(200).json({ message: 'Session added to wishlist', isInWishlist: true });
    }
  } catch (error: any) {
    console.error("Error updating wishlist:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the wishlist." });
  }
};


export const isSessionInWishlist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.userData as IUserData;
    const { sessionId } = req.params;
      

    const user = await UserModel.findById(id); 

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    user.wishlistSessionIds = user.wishlistSessionIds || [];

    // Check if the sessionId is in the wishlist
    const isInWishlist = user.wishlistSessionIds.includes(sessionId);

    if (isInWishlist) {
      let wishlist = {sessionId: sessionId, isInWislist: true}
      return res.status(200).json({ message: 'Session is in the wishlist', wishlist: wishlist });
    } else {
      let wishlist = {sessionId: sessionId, isInWislist: false}
      return res.status(404).json({ message: 'Session is not in the wishlist', wishlist: wishlist });
    }

  } catch (error: any) {
    console.error("Error checking wishlist:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while checking the wishlist." });
  }
};


export const wishlistSessions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.userData as IUserData; 
    const { sessionId } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    const wishlistSessionIds = user?.wishlistSessionIds;

    const sessions = await SessionModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'instructorId',
        select: 'firstName lastName',
      });

    const filteredSessions = await Promise.all(
      sessions.map(async (session: any) => {
        // Check if the session is in the user's wishlist
        if (!wishlistSessionIds?.includes(session?._id.toString())) {
          return null; // Skip this session if it's not in the wishlist
        }

        // Check if the session has a booking for this user
        const booking = await BookingModel.findOne({
          sessionId: session._id, 
          studentId: id,
        });

        // Only return sessions where the status is not "booked" or is "completed" or "cancelled"
        if (booking && booking.status === 'booked') {
          return null; // Skip this session if it's still booked
        }

        return session;
      })
    );

    const validSessions = filteredSessions.filter((session) => session !== null);

    console.log("validSessions--", validSessions);
    

    return res.status(HttpStatus.OK).json({
      message: 'Sessions successfully fetched',
      sessions: validSessions,
    });

  } catch (error: any) {
    console.error('Error fetching wishlist:', error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred while fetching the wishlist.',
    });
  }
};



export const removeFromwishlist = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.userData as IUserData; 
    const { sessionId } = req.body; 

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    user.wishlistSessionIds = user.wishlistSessionIds || [];

    // Check if the sessionId is in the wishlist
    if (user.wishlistSessionIds.includes(sessionId)) {
      // Remove the sessionId from the wishlist
      user.wishlistSessionIds = user.wishlistSessionIds.filter(id => id !== sessionId);
      await user.save();
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Session not found in wishlist' });
    }

    // Fetch all the sessions in the updated wishlist
    const wishlistSessionIds = user.wishlistSessionIds;

    const sessions = await SessionModel.find({ '_id': { $in: wishlistSessionIds } })
      .sort({ createdAt: -1 }) 
      .populate({
        path: 'instructorId',
        select: 'firstName lastName', 
      });

    return res.status(HttpStatus.OK).json({ message: 'Session removed and updated wishlist fetched successfully', sessions});

  } catch (error: any) {
    console.error("Error removing session and fetching wishlist:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while processing the request." });
  }
};


export const getInstructors = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;

  try {
    const instructors = await UserModel.aggregate([
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
    return res.status(HttpStatus.OK).json({ message: "Instructors data fetched successfully", instructors });
  } catch (error) {
    console.error("Error fetching Instructors:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching Instructors" });
  }
};

export const getInstructorProfile = async (req: Request, res: Response): Promise<Response> => {
  let token = req.header("Authorization"); 
  const {id, role} = req.userData as IUserData;

  const { instId } = req.params;
  try {
    const user = await userService.findUserById(instId);
    if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
    }
    
    const profile = await userService.findUserById(instId );
    if (!profile) {
      console.log("No details were found in the instructor profile", profile);
    }

    const userData = {
      id:user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePicUrl: user.image?.url ? user.image?.url : null,
      profilePicKey: user.image?.key ? user.image?.key : null,
      country: user.country,
      education: user.education,
      about: user.about,
      occupation: user?.occupation,
      currentInstitution: user?.currentInstitution,
      teachingViews: user?.teachingViews,
      achievements: user?.achievements,
      experience: user?.experience
    };
    
    return res.status(HttpStatus.OK).json({ message: "User profile fetched successfully",  ...userData });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the profile" });
  }
};