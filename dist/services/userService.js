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
// src/services/userService.ts
const userRepository_1 = require("../repositories/userRepository");
// import {IProfile} from '../models/userProfile'
class UserService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("in createUser service");
            return this.userRepository.createUser(userData);
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findUserByEmail(email);
        });
    }
    findUserByGoogleId(googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findUserByGoogleId(googleId);
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.findUserById(id);
        });
    }
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
}
exports.UserService = UserService;
