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
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("../config/config"));
const userRepoService_1 = require("../services/userRepoService");
const passport_google_oauth2_1 = require("passport-google-oauth2");
const userService = new userRepoService_1.UserService();
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: config_1.default.googleClientId || '',
    clientSecret: config_1.default.googleClientSecret || '',
    callbackURL: '/api/auth/google/callback',
    scope: ["profile", "email"]
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const googleId = profile.id;
        const firstName = ((_a = profile.name) === null || _a === void 0 ? void 0 : _a.givenName) || "";
        const lastName = ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.familyName) || "";
        const email = (_d = (_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value;
        if (!email) {
            return done(new Error('Email not available from Google profile'));
        }
        // let user = await userRepository.findUserByGoogleid(profile.id);
        let user = yield userService.findUserByEmail(email);
        // user already in db, check if verified or not
        if ((user === null || user === void 0 ? void 0 : user.isVerified) === false) {
            user = yield userService.updateUserVerification(email);
            console.log("user found");
        }
        if (!user) {
            // the user not in db, create new user
            user = {
                googleId: profile.id,
                firstName,
                lastName,
                email,
                role: 'student',
                isVerified: true
            };
            let response = yield userService.createUser(user);
            console.log("user created in passport");
            user = response;
        }
        return done(null, user);
    }
    catch (error) {
        console.log("error in passport :- ", error);
        done(error, null);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.findUserById(id);
        done(null, user);
    }
    catch (error) {
        console.log("error in passport :- ", error);
        done(error, null);
    }
}));
