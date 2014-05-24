var util     = require('./util.js');
var mustache = require('mustache-express');
var express  = require('express');
var passport = require('passport');
var app  = express();

app.set('view engine', 'mustache');
app.engine('html', mustache());

app.configure(function(){
  app.use(express.cookieParser());
  app.use(express.session({secret: util.getVar('SESSION_SECRET')}));
  app.use(passport.initialize());
  app.use(passport.session());
});


routes = require('./routes');
routes(app);

module.exports = {"app": app};
