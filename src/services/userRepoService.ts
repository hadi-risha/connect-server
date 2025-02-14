// REPOSITORY USER SERVICE
import { UserRepository } from '../repositories/userRepository';
import { IUser } from '../interfaces/userRepoInterface';
import { ISession } from '../models/sessionModel';
import { IBooking } from '../models/bookingModel'
import { IRating } from '../models/ratingModel';
import { INotification } from '../models/notificationModel';
import { IChat } from '../models/chatModel';
import { IMessage } from '../models/messageModel';
import { IPost } from '../models/postModel';

// import {IProfile} from '../models/userProfile'

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    // ***
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        console.log("in createUser service");
        return this.userRepository.createUser(userData);
    }

    // ***
    async findUserByEmail(email: string): Promise<IUser | null> {
        return this.userRepository.findUserByEmail(email);
    }

    // ***
    async findUserById(id: string): Promise<IUser | null> {
        return this.userRepository.findUserById(id);
    }

    // ***
    async updateUserVerification(email: string): Promise<IUser | null> {
        return this.userRepository.updateUserVerification(email);
    }

    async findUserByResetToken(token: string): Promise<IUser | null> {
        return this.userRepository.findUserByResetToken(token);
    }

    // async findUserByGoogleId(googleId: string): Promise<IUser | null> {
    //     return this.userRepository.findUserByGoogleId(googleId);
    // }


    async updateUserDetails(profileData: IUser): Promise<IUser> {
        return this.userRepository.updateUserDetails(profileData)
    }
    
    async createSession(sessionData: Partial<ISession>): Promise<ISession> {
        return this.userRepository.createSession(sessionData)
    }

    async findSessionById(id: string): Promise<ISession | null> {
        return this.userRepository.findSessionById(id);
    }

    async updateSessionDetails(sessionData: ISession): Promise<ISession> {
        return this.userRepository.updateSessionDetails(sessionData)
    }

    async deleteSessionById(id: string): Promise<boolean> {
        return this.userRepository.deleteSessionById(id); 
    }

    async createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
        return this.userRepository.createBooking(bookingData)
    }  

    async fetchSessions(): Promise<ISession[] | null> {
        return this.userRepository.fetchSessions();
    }

    // async fetchSingleSessions(): Promise<ISession | null> {
    //     return this.userRepository.fetchSingleSessions();
    // }

    async switchUserRole(id: string, newRole: string): Promise<IUser> {
        return this.userRepository.switchUserRole(id, newRole)
    }

    async bookedSessions(studentId: string): Promise<IBooking[] | null> {
        return this.userRepository.bookedSessions(studentId);
    }

    async instructorBookedSessions(istructorId: string): Promise<IBooking[] | null> {
        return this.userRepository.instructorBookedSessions(istructorId);
    }

    async instructorAvailableSessions(istructorId: string): Promise<ISession[] | null> {
        return this.userRepository.instructorAvailableSessions(istructorId);
    }

    async updateIsRoleChanged(id: string ): Promise<IUser | null> {
        return this.userRepository.updateIsRoleChanged(id)
    }

    
    async findBookingById(id: string): Promise<IBooking | null> {
        return this.userRepository.findBookingById(id);
    }

    async findBookingByIdS(studentId: string, sessionId: string): Promise<IBooking | null> {
        return this.userRepository.findBookingByIdS(studentId, sessionId);
    }

    async searchSessions(query: string, studentId: string ): Promise<ISession[] | null> {
        return this.userRepository.searchSessions(query, studentId);
    }

    async instructorSearchSessions(query: string, instructorId: string ): Promise<ISession[] | null> {
        return this.userRepository.instructorSearchSessions(query, instructorId);
    }

    async sessionHistory(userId: string): Promise<IBooking[] | null> {
        return this.userRepository.sessionHistory(userId);
    }
    async instructorSessionHistory(userId: string): Promise<IBooking[] | null> {
        return this.userRepository.instructorSessionHistory(userId);
    }

    async pendingSessions(studentId: string): Promise<IBooking[] | null> {
        return this.userRepository.pendingSessions(studentId);
    }

    async rateInstructor( ratingData: Partial<IRating> ): Promise<IRating | null> {
        return this.userRepository.rateInstructor(ratingData)
    }


    async findBookingAndChangeStatus(id: string, status : string ): Promise<IBooking | null> {
        return this.userRepository.findBookingAndChangeStatus(id, status)
    }

    async fetchNotifications(): Promise<INotification[] | null> {
        return this.userRepository.fetchNotifications()
    }

    // async findChatWithUserIds(id: string, chatPartnerId: string): Promise<IChat | null> {
    //     return this.userRepository.findChatWithUserIds(id, chatPartnerId)
    // }

    // async createMessage( messageData: Partial<IMessage> ): Promise<IMessage | null> {
    //     return this.userRepository.createMessage(messageData)
    // }

    // async createChat( chatData: Partial<IChat> ): Promise<IChat | null> {
    //     return this.userRepository.createChat(chatData)
    // }

    // async updateChatMessages( chatId: string, updateChatData: Partial<IChat> ): Promise<IChat | null> {
    //     return this.userRepository.updateChatMessages(chatId, updateChatData )
    // }

    // async fetchMessages(messageIds: string[]): Promise<IMessage[] | null> {
    //     return this.userRepository.fetchMessages(messageIds)
    // }

    // async fetchInteractedUsersList( id: string ): Promise<IChat[] | null> {
    //     return this.userRepository.fetchInteractedUsersList(id )
    // }


    async createPost(postData: Partial<IPost>): Promise<IPost | null> {
        return this.userRepository.createPost(postData)
    }

    async fetchPosts(): Promise<IPost[] | null> {
        return this.userRepository.fetchPosts();
    }

    async findPostById(id: string): Promise<IPost | null> {
        return this.userRepository.findPostById(id);
    }

    async updatePostById(id: string, newLikes: Record<string, boolean>): Promise<IPost | null> {
        return this.userRepository.updatePostById(id, newLikes);
    }
    

}
