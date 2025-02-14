import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import config from '../config/config';
import { UserService } from '../services/userRepoService';
import { IUser } from '../interfaces/userRepoInterface';


import { Strategy as OAuth2Strategy } from 'passport-google-oauth2'; 

const userService = new UserService();

passport.use(
  new OAuth2Strategy({
    clientID: config.googleClientId || '',
    clientSecret: config.googleClientSecret || '',
    callbackURL: '/api/auth/google/callback',
    scope:["profile","email"]
},
async (accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user?: any) => void) => {

  try {
    const googleId = profile.id;
    const firstName = profile.name?.givenName || "";
    const lastName = profile.name?.familyName || "";
    const email = profile.emails?.[0]?.value; 

    if (!email) {
      return done(new Error('Email not available from Google profile'));
    }

    // let user = await userRepository.findUserByGoogleid(profile.id);
    let user = await userService.findUserByEmail(email);
    // user already in db, check if verified or not
    if(user?.isVerified === false){
      user = await userService.updateUserVerification(email);
      console.log("user found");
    }


    if(!user){
      // the user not in db, create new user
      user = { 
        googleId:profile.id,
        firstName,
        lastName, 
        email, 
        role: 'student', 
        isVerified: true 
      } as IUser;
      let response = await userService.createUser(user); 
      console.log("user created in passport");
      user = response
    }    
    return done(null,user)

  } catch (error) {
    console.log("error in passport :- ",error);

    done(error, null);  
  }
}));


passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.findUserById(id);     
    done(null, user);
  } catch (error) {
    console.log("error in passport :- ",error);
    
    done(error, null);
  }
});























