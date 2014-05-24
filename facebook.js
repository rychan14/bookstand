var FB   = require('fb');
var util = require('./util');

function getGroupPosts(groupId, accessToken, callback, limit){
  if (typeof limit === 'undefined') limit = 20;

  if (limit > 200)  throw Exception("Count cannot be larger than 200");
  if (limit < 0)    throw Exception("Count cannot be less than 0");
  if (limit === 0)  return callback({data: []});

  var post_fields = ['id', 'from', 'message', 'created_time', 'updated_time'];
  FB.setAccessToken(accessToken);
  FB.api("/" + groupId + '/feed/', {'fields': post_fields, 'limit': limit}, callback);
}

function postToGroup(groupId, accessToken, content, callback){
  FB.setAccessToken(accessToken);
  FB.api('/' + groupId + '/feed/', 'post', {'message': content}, callback);
}

module.exports = {
  'getGroupPosts': getGroupPosts,
  'postToGroup': postToGroup

};
