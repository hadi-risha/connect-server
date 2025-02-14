// REPOSITORY USER INTERFACE

import { Document } from 'mongoose';
import { ISession } from '../models/sessionModel';
import { IBooking } from '../models/bookingModel'
import { IRating } from '../models/ratingModel';
import { INotification } from '../models/notificationModel';
import { IChat } from '../models/chatModel';
import { IMessage } from '../models/messageModel';
import { IPost } from '../models/postModel';



export interface IUser extends Document {
  googleId?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  isRoleChanged: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;

  about?: string;
  country?: string;
  occupation?: string;
  currentInstitution?: string;
  teachingViews?: string ;
  achievements?: string;
  education?: string;
  experience?: string;
  image?: {
    key?: string;
    url?: string;
  };
}

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(id: string): Promise<IUser | null>;
  updateUserVerification(email: string): Promise<IUser | null>;
  findUserByResetToken(token: string): Promise<IUser | null>;
  // findUserByGoogleId(googleId: string): Promise<IUser | null>;
  updateIsRoleChanged(id: string ): Promise<IUser | null>;





  updateUserDetails(profileData: Partial<IUser>): Promise<IUser | null>;




  
  createSession(sessionData: ISession): Promise<ISession>;
  findSessionById(id: string): Promise<ISession | null>;

  updateSessionDetails(sessionData: Partial<ISession>): Promise<ISession | null>;
  deleteSessionById(id: string): Promise<boolean>;

  
  createBooking(bookingData: IBooking): Promise<IBooking>;

  fetchSessions(): Promise<ISession[] | null>;

  switchUserRole(id: string, newRole: string): Promise<IUser | null>;

  bookedSessions( id: string ): Promise<IBooking[] | null>;
  instructorBookedSessions( id: string ): Promise<IBooking[] | null>;


  instructorAvailableSessions( id: string ): Promise<ISession[] | null>;
  updateIsRoleChanged(id: string ): Promise<IUser | null>;

  findBookingById(id: string): Promise<IBooking | null>;
  findBookingByIdS(studentId: string, sessionId: string): Promise<IBooking | null>



  searchSessions( query: string, userId: string ): Promise<ISession[] | null>;
  instructorSearchSessions( query: string, instructorId: string ): Promise<ISession[] | null>;

  sessionHistory( id: string ): Promise<IBooking[] | null>;
  instructorSessionHistory( id: string ): Promise<IBooking[] | null>;
  pendingSessions( id: string ): Promise<IBooking[] | null>;

  rateInstructor( ratingData: Partial<IRating> ): Promise<IRating | null>;

  findBookingAndChangeStatus( id: string, status : string ): Promise<IBooking | null>;

  
  fetchNotifications(): Promise<INotification[] | null>;




  // findChatWithUserIds(id: string, chatPartnerId: string): Promise<IChat | null>;

  // createMessage( messageData: Partial<IMessage> ): Promise<IMessage | null>;

  // createChat( chatData: Partial<IChat> ): Promise<IChat | null>;

  // updateChatMessages( chatId: string, updateChatData: Partial<IChat> ): Promise<IChat | null>;

  // fetchMessages( messageIds: string[] ): Promise<IMessage[] | null>;

  // fetchInteractedUsersList( id: string ): Promise<IChat[] | null>;


  

  createPost(postData: IPost): Promise<IPost | null>;


  fetchPosts(): Promise<IPost[] | null>;

  findPostById(id: string): Promise<IPost | null>;
  updatePostById(id: string, newLikes: Record<string, boolean>): Promise<IPost | null>;











}
