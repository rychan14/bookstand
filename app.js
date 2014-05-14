var util     = require('./util');
var mustache = require('mustache-express');
var express  = require('express');
var passport = require('passport');
var app  = express();
var port = process.env.PORT || 3000;

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

app.listen(port, function() {
  return console.log("Listening on " + port + "\nPress CTRL-C to stop server.");
});
