var db                  = require('./db.js');
var util                = require('./util.js');
var fbook                = require('./facebook.js');

var FB_APP_ID           = util.getVar("FB_APP_ID");
var FB_CALLBACK_URL     = util.getVar("SERVER_URL") + '/auth/facebook/callback';
var DB_BOOK_FIELDS      = require('./constants.js').DB_BOOK_FIELDS;
var BOOKSTAND_SIGNATURE = require('./constants.js').BOOKSTAND_SIGNATURE;
var FB_GROUP_ID         = util.getVar('TEST_TEXTBOOK_GRP_ID');

function post(user, params, cb){
  console.log("MkPost");
  console.log(params);
  console.log(user);
  var book = {
    fromFbId    : user.id,
    fromName    : user.displayName,
    createdTime : new Date(),
    updatedTime : new Date(),
  };
  DB_BOOK_FIELDS.forEach(function(field){
    if (field in params){
      book[field] = params[field];
    }
  });
  console.log(book);
  if (params.postToGroup){
    var toPost = book.message + "\n" + BOOKSTAND_SIGNATURE;
    fbook.postToGroup(FB_GROUP_ID, user.token, toPost, function(res){
      console.log("FB RESULT");
      console.log(res);
      if (!res || res.error) {
        console.log("Post to FB failed");
        cb(res);
      } else {
        book.originalPostId = res.id;
        db.insertColl('books', [book], cb);
      }
    });
  } else {
    db.insertColl('books', [book], cb);
  }
}

module.exports = post;
