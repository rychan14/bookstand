var post = require('../post.js');

function insert(req, res){
  if (!req.user)
    return res.render('index.html');
  else {
    post(req.user, req.body, function(err){
      if (!err)
        res.render('post_success.html');
      else
        res.render('post_error.html');
    });
  }
}

module.exports = insert;
