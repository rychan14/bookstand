var _           = require('underscore');
var getVar      = require('./util.js').getVar;
var book        = require('./facebook.js');
var brain       = require('./brain.js');
var constants   = require('./constants.js');
var db          = require('./db.js');
var fbGroupId   = getVar('TEXTBOOK_GRP_ID');
var fbToken     = getVar('TEST_TOKEN');

function formatPostForDB(post){
  //console.log("POST");
  //console.log(post);
  var formattedPost = {
    "id"          : post.id,
    "message"     : post.message,
    "createdTime" : new Date(post.created_time),
    "updatedTime" : new Date(post.updated_time),
    "fromFbId"    : post.from.id,
    "fromFbName"  : post.from.name
  };
  //console.log("FMT");
  //console.log(formattedPost);
  return formattedPost;
}

function associateBookWithPost(book, post){
  /*console.log("BOOK");
  console.log(book);
  console.log("BPOST");
  console.log(post); */
  var b             = book;
  b.originalPostId  = post.id;
  b.originalMessage = post.message;
  b.createdTime     = new Date(post.created_time);
  b.updatedTime     = new Date(post.updated_time);
  b.fromFbId        = post.from.id;
  b.fromName        = post.from.name;
  /* console.log("NEWBOOK");
  console.log(b); */
  return b;
}

function notFromBookstand(message){
  return !message || message.indexOf(constants.BOOKSTAND_SIGNATURE) == -1;
}

function getBooksFromPost(post){
  console.log("POST");
  console.log(post);
  var books = brain.classifyPostFromText(post.message);
  var assoc = function(book){
    return associateBookWithPost(book, post);
  };
  console.log("BOOKS");
  console.log(_.map(books, assoc));
  return _.map(books, assoc);
}

var waiting = ["books", "posts"];

function insertComplete(err, coll, cb){
  if (err) {
    return console.log("Insertion Error" + err);
  } else {
    console.log("Received data for: " + coll);
  }
  waiting = _.filter(waiting, function(e){ return e != coll;});
  if (!waiting.length) {
    waiting = ["books", "posts"];
    console.log("Will query again in 1 minute");
    setTimeout(loopFunction, 60000);
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
  }, 15);
}

function loopFunction(){
  downloadNewPosts(function(posts){
    var books         = _.map(posts, getBooksFromPost);
    var postsToInsert = _.map(posts, formatPostForDB);
    var booksToInsert = _.flatten(books);
    db.insertColl('books', books, insertComplete);
    db.insertColl('posts', posts, insertComplete);
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
