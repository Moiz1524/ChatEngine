const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.login', new LocalStrategy({
  username: 'username',
  password: 'password',
  passReqToCallback: true
}, (req, username, password, done) => {
    User.findOne({username}, (err, user) => {
      if (err) {
        console.log('Error found!');
        return done(err);
      }
      if (!user || !user.validPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
}));
