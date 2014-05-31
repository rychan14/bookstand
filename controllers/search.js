var search          = require('../search.js');
var util            = require('../util.js');
var FB_APP_ID       = util.getVar("FB_APP_ID");
var FB_CALLBACK_URL = util.getVar("SERVER_URL") + '/auth/facebook/callback';

function render(req, res){
  //if (!req.user)
  if (false)
    return res.render('index.html');
  else {
    search.searchBooks(req.query, function(err, results){
      console.log("RESULTS: " + results);
      return res.render('search.html', {
        results: results
      });
    });
  }
}

module.exports = render;
