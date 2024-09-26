require('dotenv').config();

const passport = require("passport");
const User = require("../models/userModel");
const GoogleStrategy = require('passport-google-oauth2').Strategy;


//authentication using google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
async (request, accessToken, refreshToken, profile, cb) => {
  console.log('Google OAuth function is working');
  try {
    // Check if the user already exists by email or Google ID
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (!user) {
        // Split the displayName into parts
        const nameParts = profile.displayName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        user = new User({
          firstName: firstName,
          lastName: lastName,
          email: profile.email,
          googleId: profile.id,
          password: profile.id 
        });

        await user.save();
      } else {
        
        user.googleId = profile.id;
        await user.save();
      }
    }

    console.log('Authenticated user:', user);
    return cb(null, user);
  } catch (error) {
    console.error('Error during authentication:', error);
    return cb(error, null);
  
  }
}
));

passport.serializeUser((user, done) => {

  done(null, user.id)

})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)

    done(null, user)

  } catch (error) {

    done(error, null)

  }

})
module.exports =passport