var util            = require('../util.js');
var FB_APP_ID       = util.getVar("FB_APP_ID");
var FB_CALLBACK_URL = util.getVar("SERVER_URL") + '/auth/facebook/callback';
function render(req, res){
  if (!req.user)
    return res.render('index.html');
  else {
    var publishLoginUrl = FB.getLoginUrl({
      appId       : FB_APP_ID ,
      redirectUri : FB_CALLBACK_URL,
      scope       : 'publish_actions'
    });
    return res.render('home.html', {
      'accessToken'     : req.user.token,
      'publishLoginUrl' : publishLoginUrl
    });
  }
};

exports = {
  search: 
}
