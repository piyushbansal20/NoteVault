const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');


passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI
    },
    async function (accessToken, refreshToken, profile, done) {
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profileImage: profile.photos[0].value,
        }
        try {
            let user = await User.findOne({googleId: profile.id});
            if (user) {
                done(null, user);
            } else {
                user = await User.create(newUser);
                done(null, user);
            }
        } catch (err) {
            console.error(err);
        }

    }
));

router.get('/auth/google',
    passport.authenticate('google', { scope: ["email","profile"] }));

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login-failure',
        successRedirect: '/dashboard'}),

    );
router.get('/login-failure', (req, res) => {
    res.send('Failed to login')
});

//destroy user session
router.get('/logout',(req,res)=>{
    req.session.destroy((error)=>{
        if(error)
        {
            res.status(404).send('Unable to logout');
        }
        else {
            res.redirect('/');
        }

    })
})


//persist user data after login
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

//retrieve user data
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});


module.exports = router;
