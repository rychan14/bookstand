var _           = require('underscore');
var getVar      = require('./util.js').getVar;
var book        = require('./facebook.js');
var brain       = require('./brain.js');
var constants   = require('./constants.js');
var db          = require('./db.js');
var fbGroupId   = getVar('TEXTBOOK_GRP_ID');
var fbToken     = getVar('TEST_TOKEN');

var POSTS_TO_GET    = 3;
var QUERY_WAIT_TIME = 60000;


function formatPostForDB(post){
  var formattedPost = {
    "id"          : post.id,
    "message"     : post.message,
    "createdTime" : new Date(post.created_time),
    "updatedTime" : new Date(post.updated_time),
    "fromFbId"    : post.from.id,
    "fromFbName"  : post.from.name
  };
  return formattedPost;
}

function associateBookWithPost(book, post){
  var b            = book;
  b.originalPostId = post.id;
  b.message        = post.message;
  b.createdTime    = new Date(post.created_time);
  b.updatedTime    = new Date(post.updated_time);
  b.fromFbId       = post.from.id;
  b.fromName       = post.from.name;
  return b;
}

function notFromBookstand(message){
  return !message || message.indexOf(constants.BOOKSTAND_SIGNATURE) == -1;
}

function getBooksFromPost(post){
  var books = brain.classifyPostFromText(post.message);
  var assoc = function(book){
    return associateBookWithPost(book, post);
  };
  return _.map(books, assoc);
}

var waiting = ["books", "posts"];

function insertComplete(err, coll, cb){
  if (err) {
    console.log(err);
    if (err.code != 11000 ) // Duplicate Key Error
      return;               // TODO: Prevent this case
  }
  console.log("Received data for: " + coll);
  waiting = _.filter(waiting, function(e){ return e != coll;});
  if (!waiting.length) {
    waiting = ["books", "posts"];
    console.log("Will query again in " + QUERY_WAIT_TIME + " ms.");
    setTimeout(loopFunction, QUERY_WAIT_TIME);
  }
}


function downloadNewPosts(cb){
  console.log("Downloading new posts");
  book.getGroupPosts(fbGroupId, fbToken, function(res){
    if (!res) {
      console.log("Did not receive response from Facebook");
      return;
    }
    if (res.error) {
      console.log("Received error from FB: ");
      console.log(res.error);
      return;
    }
    console.log(res);
    posts = _.filter(res.data, function(post){return notFromBookstand(post.message);});
    cb(posts);
  }, POSTS_TO_GET);
}

function loopFunction(){
  downloadNewPosts(function(posts){
    var books         = _.map(posts, getBooksFromPost);
    var postsToInsert = _.map(posts, formatPostForDB);
    var booksToInsert = _.flatten(books);
    db.insertColl('books', booksToInsert, insertComplete);
    db.insertColl('posts', postsToInsert, insertComplete);
  });
}

module.exports = {
  associateBookWithPost : associateBookWithPost,
  formatPostForDB       : formatPostForDB,
  getBooksFromPost      : getBooksFromPost,
  notFromBookstand      : notFromBookstand
};

if(require.main === module)
  loopFunction();
