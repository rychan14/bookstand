var util       = require('./util');
var passport   = require('passport');
var FbStrategy = require('passport-facebook').Strategy;

var FB_CALLBACK_PATH = "/auth/facebook/callback";
var FB_APP_ID        = util.getVar("FB_APP_ID");
var FB_SECRET        = util.getVar("FB_SECRET");
var FB_CALLBACK_URL  = util.getVar("SERVER_URL") + FB_CALLBACK_PATH;

passport.use(new FbStrategy({
  clientID     : FB_APP_ID,
  clientSecret : FB_SECRET,
  callbackURL  : FB_CALLBACK_URL
}, function(accessToken, refreshToken, profile, done) {
    profile.token = accessToken;
    done(null, profile);
}));

passport.serializeUser(function(user, done){done(null, user); });
passport.deserializeUser(function(obj, done){done(null, obj); });

var controllers = require('./controllers');

module.exports = function(app){
  app.get('/', function(req, res, next) {
    controllers.index(req, res, next);
  });

  app.get('/search', function(req, res, next) {
    controllers.search(req, res, next);
  });

  app.get('/auth/facebook', passport.authenticate('facebook'));
  app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'}));

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
};
