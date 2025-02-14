import { Request, Response } from 'express';
import { UserService } from '../services/userRepoService';
import { HttpStatus } from '../utils/httpStatusCodes';
import { uploadImageToS3, deleteImageFromS3 } from '../utils/s3Service';
import config from '../config/config';
import bcrypt from 'bcryptjs'; 
import mongoose from 'mongoose';
import { IInstructor, ISession } from '../models/sessionModel';
import { ChatModel, IChat } from '../models/chatModel';
// import { getReceiverSocketId, io } from '../utils/socket';
import { IPost, PostModel } from '../models/postModel';
import { UserModel } from '../models/userModel';
import { MessageModel } from '../models/messageModel';
import { AiChatModel } from '../models/aiChat';
import { AiUserChatsModel } from '../models/aiUserChats';
import { BookingModel } from '../models/bookingModel';


const userService = new UserService();

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
    
    const profile = await userService.findUserById(id );
    if (!profile) {
      console.log("No details were found in the user profile", profile);
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


// export const instructorHome = async (req: Request, res: Response): Promise<Response> => {
//     let token = req.header("Authorization"); 
    
//     if (req.userData && typeof req.userData === 'object' && 'id' in req.userData) {
//       const id = (req.userData as { id: string }).id;       
//       try {
//           const user = await userService.findUserById(id);
//           return res.json({message: "user data", user });
//       } catch (error) {
//           return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching user' });
//       }
//     }
//     return res.status(HttpStatus.OK).json({ message: "Welcome to the instructor Home Page", userData: req.userData });
// };


export const sessions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const sessions = await userService.fetchSessions();
    return res.status(HttpStatus.OK).json({ message: "Sessions successfully fetched", sessions });
  } catch (error:any) {
    console.error("Failed to fetch sessions:- ", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch sessions",error: error.message});
  }
};


interface IUserData {
  id: string;
  role: string;
}

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  const { firstName, lastName, about, country, occupation,currentInstitution,
    teachingViews,achievements,
    education,experience, imageStatus} = req.body;
  console.log("imageStatus:- ", imageStatus);

  try {
    let token = req.header("Authorization"); 
    const {id, role} = req.userData as IUserData;

    const profilePicFile = req.file;
    console.log("profilePicFile", profilePicFile);

    const key = req.file;
    console.log("image key >> req.file.key : ", key);

    const imageUnchanged = imageStatus === 'unchanged';
    const deleteProfilePic = imageStatus === 'deleted';
    const updateProfilePic = imageStatus === 'updated';

    // console.log("imageUnchanged     ", imageUnchanged);
    // console.log("updateProfilePic     ", updateProfilePic);
    // console.log("deleteProfilePic     ", deleteProfilePic);

    const existingProfile = await userService.findUserById(id);
    if (!existingProfile) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "User doesn't exist" });
    }

    console.log("image from frontend - key : ", profilePicFile);
    console.log("already exist image..from backend db        " , existingProfile?.image);

    // upload the profile picture to S3 if provided
    let profilePicUrl = '';
    if (profilePicFile && updateProfilePic) {
      console.log("profile pic changed");
      const { url: profilePicUrl, key: profilePicKey } = await uploadImageToS3(profilePicFile);
      
      existingProfile.image = {
        url: profilePicUrl,
        key: profilePicKey,
      };
      console.log("student profile uploaded in s3-", profilePicUrl);
      console.log("profilePicFile && updateProfilePic", profilePicFile , updateProfilePic);
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
        console.log("No action needed, existing image values remain");
    }else{
      console.log("something went wrong in image upload", profilePicUrl);
      console.log("profilePicFile && updateProfilePic", profilePicFile , updateProfilePic);
    }

    existingProfile.firstName = firstName ?? existingProfile.firstName;
    existingProfile.lastName = lastName ?? existingProfile.lastName;
    if (about !== undefined) existingProfile.about = about;
    if (country !== undefined) existingProfile.country = country;
    if (occupation !== undefined) existingProfile.occupation = occupation;
    if (currentInstitution !== undefined) existingProfile.currentInstitution = currentInstitution;
    if (teachingViews !== undefined) existingProfile.teachingViews = teachingViews;
    if (achievements !== undefined) existingProfile.achievements = achievements;
    if (education !== undefined) existingProfile.education = education;
    if (experience !== undefined) existingProfile.experience = experience;
    
    const updatedProfile = await userService.updateUserDetails(existingProfile);
    return res.status(HttpStatus.OK).json({ message: "Profile successfully updated", profile: updatedProfile });
  } catch (error:any) {
    console.error("Error updating profile:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the profile",error: error.message});
  }
};


export const getSession = async (req: Request, res: Response): Promise<Response> => {
  const { sessionId } = req.params;  
  const {id, role} = req.userData as IUserData;  
  try {
    const user = await userService.findUserById(id);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Instructor not found" });
    }

    const session = await userService.findSessionById(sessionId);
    if (!session) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Session not found" });
    }
  
    const sessionData = {
      id: session._id,
      title: session.title,
      introduction: session.introduction,
      duration: session.duration,
      fee: session.fee,
      descriptionTitle: session.descriptionTitle,
      description: session.description,
      timeSlots: session.timeSlots,
      sessionimgUrl: session.coverImage?.url ? session.coverImage?.url : null,
      sessionimgKey: session.coverImage?.key ? session.coverImage?.key : null,

      instructorId: (session.instructorId as IInstructor)?._id,
      firstName: (session.instructorId as IInstructor)?.firstName,
      lastName: (session.instructorId as IInstructor)?.lastName,
      instructorImg: (session.instructorId as IInstructor)?.image.url,
    };
    
    return res.status(HttpStatus.OK).json({ message: "Session details fetched successfully",  ...sessionData });
  } catch (error) {
    console.error("Error fetching session data:- ", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the session deta" });
  }
};


export const createSession = async (req: Request, res: Response): Promise<Response> => {
  const { title, introduction, duration, fee, descriptionTitle, description, category, rawTimeSlots } = req.body;
  const timeSlots = rawTimeSlots.split(',');
  console.log("req.body :- ",  title, introduction, duration, fee, descriptionTitle, description, rawTimeSlots);
  console.log("session time rawTimeSlots :- ", rawTimeSlots);

  const coverImageFile = req.file;
  console.log("session cover image:- ", coverImageFile);

  if (!title) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Title required" });
  }
  if (!introduction) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Introduction required" });
  }
  if (!duration) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Duration required" });
  }
  if (!fee) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Fees required" });
  }
  if (!descriptionTitle) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Description title required" });
  }
  if (!description) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Description required" });
  }
  if (!rawTimeSlots) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Time slots are required" });
  }
  if (!category) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Category is required' });
  }
  if (!coverImageFile) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Cover image is required' });
  }
  
  if (
    !title.trim() ||
    !introduction.trim() ||
    !descriptionTitle.trim() ||
    !description.trim() 
   ) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Field cannot be empty" });
  }
  
  try {
    const {id, role} = req.userData as IUserData;

    const { url: coverImageUrl, key: coverImageKey } = await uploadImageToS3(coverImageFile);
    console.log(" image url from  s3:- ", coverImageUrl); 
    console.log(" image key from  s3:- ", coverImageKey);

    const existingInstructor = await userService.findUserById(id);
    if (!existingInstructor) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Instructor doesn't exist, cannot create session" });
    }

    const session = await userService.createSession({
      title, 
      introduction,
      duration, 
      fee, 
      descriptionTitle,
      description, 
      category,
      timeSlots,
      coverImage: {
        url: coverImageUrl,  
        key: coverImageKey  
      },
      instructorId: new mongoose.Types.ObjectId(id),
    } as Partial<ISession>);

    return res.status(HttpStatus.OK).json({ message: 'Session successfully created', data: session,  file: coverImageFile });
  } catch (error:any) {
    console.error("Error creating session profile:- ", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the session",error: error.message});
  }
};


export const updateSession = async (req: Request, res: Response): Promise<Response> => {
  const { title, introduction, duration, fee, descriptionTitle, description, category, rawTimeSlots, imageStatus, sessionId } = req.body;
  console.log("(02:48,02:48,23:51 - format) rawTimeSlots:- ", rawTimeSlots);

  const timeSlots = rawTimeSlots.split(',');
  console.log("session time slots:- ", timeSlots);
  console.log("imageStatus -> ", imageStatus);
  
  const coverImageFile = req.file;
  console.log("cover image", coverImageFile);

  if (!title) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Title required" });
  }
  if (!introduction) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Introduction required" });
  }
  if (!duration) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Duration required" });
  }
  if (!fee) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Fees required" });
  }
  if (!descriptionTitle) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Description title required" });
  }
  if (!description) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Description required" });
  }
  if (!rawTimeSlots) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Time slots are required" });
  }
  if (!category) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Category required" });
  }
  if (!coverImageFile) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Cover image is required' });
  }

  if (
    !title.trim() ||
    !introduction.trim() ||
    !descriptionTitle.trim() ||
    !description.trim() 
   ) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Field cannot be empty" });
  }
  try {
    const {id, role} = req.userData as IUserData;

    const imageUnchanged = imageStatus === 'unchanged';
    const deleteCoverImage = imageStatus === 'deleted';
    const updateCoverImage = imageStatus === 'updated';
    console.log("imageUnchanged:- ", imageUnchanged);
    console.log("updateProfilePic:- ", updateCoverImage);
    console.log("deleteProfilePic:- ", deleteCoverImage);

    const existingInstructor = await userService.findUserById(id);
    if (!existingInstructor) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Instructor doesn't exist, cannot create session" });
    }

    const existingSession = await userService.findSessionById(sessionId);
    if (!existingSession) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Session doesn't exist" });
    }
    console.log("already exist image from db:- " , existingSession?.coverImage?.key);

    
    // upload the profile picture to S3 if new image provided
    let coverImageUrl = '';
    if (coverImageFile && updateCoverImage) {
      console.log("profile pic changed");
      const { url: coverImageUrl, key: coverImageKey } = await uploadImageToS3(coverImageFile);

      existingSession.coverImage = {
        url: coverImageUrl,
        key: coverImageKey,
      };
      console.log("cover image uploaded in s3:- ", coverImageKey);
    } else if (imageUnchanged) {
        console.log("cover image not changed");
        existingSession.coverImage = {
          url: existingSession.coverImage?.url,
          key: existingSession.coverImage?.key,
        };
    }else{
      console.log("something went wrong in image upload", coverImageUrl);
    }    

    existingSession.title = title ?? existingSession.title; 
    existingSession.introduction = introduction ?? existingSession.introduction;
    existingSession.duration = duration ?? existingSession.duration;
    existingSession.fee = fee ?? existingSession.fee;
    existingSession.descriptionTitle = descriptionTitle ?? existingSession.descriptionTitle;
    existingSession.description = description ?? existingSession.description;
    existingSession.category = category ?? existingSession.category;
    existingSession.timeSlots = timeSlots ?? existingSession.timeSlots;
      
    const updatedSession = await userService.updateSessionDetails(existingSession);
    return res.status(HttpStatus.OK).json({ message: "Session Details successfully updated", session: updatedSession });
  } catch (error:any) {
    console.error("Error creating session:- ", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while updating the session",error: error.message});
  }
};


export const deleteSession = async (req: Request, res: Response): Promise<Response> => {
  const { sessionId } = req.params;
  try {
    const existingSession = await userService.findSessionById(sessionId);
    if (!existingSession) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Session doesn't exist" });
    }
    
    // Delete the cover image from S3 if it exists
    if (existingSession.coverImage?.key) {

      console.log("existingSession.coverImage.key:- ",existingSession.coverImage.key);
      
      // try {
      //   await deleteImageFromS3(existingSession.coverImage.key);
      //   console.log("Cover image deleted from S3");
      // } catch (s3Error) {
      //   console.error("Error deleting image from S3:", s3Error);
      //   return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error deleting session image from S3" });
      // }
    }

    // Delete the session from the database
    const wasDeleted = await userService.deleteSessionById(sessionId);
    if (!wasDeleted) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Session not found or already deleted" });
    }
    return res.status(HttpStatus.OK).json({ message: "Session successfully deleted" });
  } catch (error: any) {
    console.error("Error deleting session:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while deleting the session", error: error.message });
  }
};


export const switchUserRole = async (req: Request, res: Response): Promise<Response> => {
  const {id, role} = req.userData as IUserData;
  const newRole = 'student'
  try {
    const updatedUser = await userService.switchUserRole(id, newRole)    
    return res.status(HttpStatus.CREATED).json({ message: "User role updated successfully", ...updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error updating user role:" });
  }
}


export const bookedSessions = async (req: Request, res: Response): Promise<Response> => {
  const {id, role} = req.userData as IUserData;
  try {
    const bookedSessions = await userService.instructorBookedSessions(id)    
    return res.status(HttpStatus.OK).json({ message: "Booked sessions fetched successfully", ...bookedSessions });
  } catch (error) {
    console.error("Error fetching booked sessions:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching booked sessions:" });
  }
}


export const availableSessions = async (req: Request, res: Response): Promise<Response> => {
  const {id, role} = req.userData as IUserData;
  try {
    const availableSessions = await userService.instructorAvailableSessions(id)    
    return res.status(HttpStatus.OK).json({ message: "Instructor sessions fetched successfully", ...availableSessions });
  } catch (error) {
    console.error("Error fetching booked sessions:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching instructor sessions:" });
  }
}


export const sessionHistory = async (req: Request, res: Response): Promise<Response> => {
  const {id, role} = req.userData as IUserData;
  
  try {
    const bookedSessions = await userService.instructorSessionHistory(id)    
    return res.status(HttpStatus.OK).json({ message: "Session history fetched successfully", historyData: bookedSessions });
  } catch (error) {
    console.error("Error fetching booked sessions:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching history:" });
  }
}


export const searchSessions = async (req: Request, res: Response): Promise<Response> => {
  const { query } = req.query as { query?: string }; 
  const { id } = req.userData as IUserData;

  if (!query) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Query parameter is required" });
  }

  try {
    const searchResults = await userService.instructorSearchSessions(query, id);
    return res.status(HttpStatus.OK).json({ message: "Search results fetched successfully",  searchResults });
  } catch (error) {
    console.error("Error performing search:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error performing search" });
  }
}


export const fetchNotifications = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id, role} = req.userData as IUserData;
    const notifications = await userService.fetchNotifications();
    return res.status(HttpStatus.OK).json({ message: "Notifications fetched successfully", notifications,});
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching notifications:" });
  }
}


export const createPost = async (req: Request, res: Response): Promise<Response> => {
  const { description } = req.body;

  const image = req.file;
  console.log("post image:- ", image);

  if (!description) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Description required' });
  }
  if ( !description.trim() ) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: "Field cannot be empty" });
  }
  if (!image) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Cover image is required' });
  }
  
  try {
    const {id, role} = req.userData as IUserData;

    const { url: imageUrl, key: imageKey } = await uploadImageToS3(image);
    console.log(" image url from  s3:- ", imageUrl); 
    console.log(" image key from  s3:- ", imageKey);

    const existingInstructor = await userService.findUserById(id);
    if (!existingInstructor) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: "Instructor doesn't exist, cannot create post" });
    }

    const post = await userService.createPost({
      instructorId: new mongoose.Types.ObjectId(id),
      description,
      image: {
        url: imageUrl,  
        key: imageKey  
      },
    } as Partial<IPost>);

    return res.status(HttpStatus.OK).json({ message: 'Post successfully created', post: post });
  } catch (error:any) {
    console.error("Error creating session profile:- ", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while creating the session",error: error.message});
  }
};


export const getFeedPosts = async (req: Request, res: Response): Promise<Response> => {
  const {id, role} = req.userData as IUserData;
  try {
    const allPosts = await userService.fetchPosts()
    return res.status(HttpStatus.OK).json({ message: "Posts fetched successfully", posts: allPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching posts:" });
  }
}


export const likePost = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {id, role} = req.userData as IUserData;

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
    return res.status(HttpStatus.OK).json({ message: "Chat List fetched successfully", updatedPost:updatedPost });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error fetching chat:" });
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

    // Create a comment object, ensuring userId is cast to ObjectId
    const newComment = {
      userId: new mongoose.Types.ObjectId(id),
      comment: comment,
    };
    
    // Add the new comment to the comments array
    post?.comments?.push(newComment);

    // Save the updated post with the new comment
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


export const fetchWallet = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, role } = req.userData as IUserData;

    const walletData = await BookingModel.find({ instructorId: id })
    .populate("studentId", "_id firstName lastName image.url")
    .populate("sessionId", "fee")    

    return res.status(HttpStatus.OK).json({ message: "Wallet data fetched successfully",  walletData: walletData});
  } catch (error: any) {
    console.error("Error fetching Ai chatlist:", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching the wallet data." });
  }
};


