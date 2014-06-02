var book = require('../facebook.js');

function comment(req, res){
  if (!req.user)
    return res.render('index.html');
  else {
    book.commentOnPost(req.body.postId, req.user.token, req.body.message, function(response){
      console.log("Comment: ");
      console.log(req.body.postId);
      console.log(req.user.token);
      console.log(req.body.message);
      console.log(response);
      if (response && !response.error)
        res.render('comment_success.html');
      else
        res.render('comment_error.html');
    });
  }
}

module.exports = comment;
