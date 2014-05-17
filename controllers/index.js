exports.index = function(req, res){
  if (!req.user)
    return res.render('index.html');
  else
    return res.render('home.html', {'access_token': req.user.token});
};
