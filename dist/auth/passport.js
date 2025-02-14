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
const config_js_1 = __importDefault(require("../config/config.js"));
const userService_js_1 = require("../services/userService.js");
const passport_google_oauth2_1 = require("passport-google-oauth2");
const userService = new userService_js_1.UserService();
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: config_js_1.default.googleClientId || '',
    clientSecret: config_js_1.default.googleClientSecret || '',
    callbackURL: '/api/auth/google/callback',
    scope: ["profile", "email"]
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log("profile", profile);
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
        console.log("user already in db, check if verified or not", user);
        if ((user === null || user === void 0 ? void 0 : user.isVerified) === false) {
            user = yield userService.updateUserVerification(email);
            console.log("user: ", user);
        }
        if (!user) {
            console.log("the user not in db, create new user");
            user = {
                googleId: profile.id,
                firstName,
                lastName,
                email,
                role: 'student',
                isVerified: true
            };
            // user = {
            //   googleId: profile.id,
            //   firstName: firstName , // provide default values if undefined
            //   lastName: lastName ,
            //   email,
            //   role: 'student',
            //   isVerified: true,
            //   resetPasswordToken: null,
            //   resetPasswordExpiry: null,
            // } as IUser;
            let response = yield userService.createUser(user);
            console.log("user created in passport, response", response);
            user = response;
        }
        console.log("user data after created or found in db==================================", user);
        return done(null, user);
    }
    catch (error) {
        console.log("error in passport 1", error);
        done(error, null);
    }
})));
passport_1.default.serializeUser((user, done) => {
    console.log("serializeUser, user   1...", user);
    // done(null, user.id);  
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userService.findUserById(id);
        console.log("deserializeUser , user   2...", user);
        done(null, user);
    }
    catch (error) {
        console.log("error in passport 3...", error);
        done(error, null);
    }
}));
