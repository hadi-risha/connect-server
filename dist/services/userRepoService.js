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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// REPOSITORY USER SERVICE
const userRepository_1 = require("../repositories/userRepository");
// import {IProfile} from '../models/userProfile'
class UserService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
    }
    // ***
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("in createUser service");
            return this.userRepository.createUser(userData);
        });
    }
    // ***
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findUserByEmail(email);
        });
    }
    // ***
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findUserById(id);
        });
    }
    // ***
    updateUserVerification(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.updateUserVerification(email);
        });
    }
    findUserByResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findUserByResetToken(token);
        });
    }
    // async findUserByGoogleId(googleId: string): Promise<IUser | null> {
    //     return this.userRepository.findUserByGoogleId(googleId);
    // }
    updateUserDetails(profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.updateUserDetails(profileData);
        });
    }
    createSession(sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.createSession(sessionData);
        });
    }
    findSessionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findSessionById(id);
        });
    }
    updateSessionDetails(sessionData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.updateSessionDetails(sessionData);
        });
    }
    deleteSessionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.deleteSessionById(id);
        });
    }
    createBooking(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.createBooking(bookingData);
        });
    }
    fetchSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.fetchSessions();
        });
    }
    // async fetchSingleSessions(): Promise<ISession | null> {
    //     return this.userRepository.fetchSingleSessions();
    // }
    switchUserRole(id, newRole) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.switchUserRole(id, newRole);
        });
    }
    bookedSessions(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.bookedSessions(studentId);
        });
    }
    instructorBookedSessions(istructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.instructorBookedSessions(istructorId);
        });
    }
    instructorAvailableSessions(istructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.instructorAvailableSessions(istructorId);
        });
    }
    updateIsRoleChanged(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.updateIsRoleChanged(id);
        });
    }
    findBookingById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findBookingById(id);
        });
    }
    findBookingByIdS(studentId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findBookingByIdS(studentId, sessionId);
        });
    }
    searchSessions(query, studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.searchSessions(query, studentId);
        });
    }
    instructorSearchSessions(query, instructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.instructorSearchSessions(query, instructorId);
        });
    }
    sessionHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.sessionHistory(userId);
        });
    }
    instructorSessionHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.instructorSessionHistory(userId);
        });
    }
    pendingSessions(studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.pendingSessions(studentId);
        });
    }
    rateInstructor(ratingData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.rateInstructor(ratingData);
        });
    }
    findBookingAndChangeStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findBookingAndChangeStatus(id, status);
        });
    }
    fetchNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.fetchNotifications();
        });
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
    createPost(postData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.createPost(postData);
        });
    }
    fetchPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.fetchPosts();
        });
    }
    findPostById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findPostById(id);
        });
    }
    updatePostById(id, newLikes) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.updatePostById(id, newLikes);
        });
    }
}
exports.UserService = UserService;
