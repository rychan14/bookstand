var util       = require('./util');
var passport   = require('passport');
var FbStrategy = require('passport-facebook').Strategy;
var index   = require('./controllers/index.js');
var search  = require('./controllers/search.js');
var post    = require('./controllers/post.js');
var comment = require('./controllers/comment.js');

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


module.exports = function(app){
  app.get('/', index);
  app.get('/search', search);

  app.post('/post', post);
  app.post('/comment', comment);
  app.get('/auth/facebook', passport.authenticate('facebook'));
  app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {successRedirect: '/', failureRedirect: '/login'}));

  app.get('/make_post', function(req, res){
    return res.render('make_post.html');
  });

  app.get("/comment/:postId", function(req, res){
    return res.render('comment.html', req.params);
  });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
};
