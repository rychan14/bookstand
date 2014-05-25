var _           = require('underscore');
var getVar      = require('./util.js').getVar;
var book        = require('./facebook.js');
var brain       = require('./brain.js');
var MongoClient = require('mongodb').MongoClient;
var fbGroupId   = getVar('TEXTBOOK_GRP_ID');
var fbToken     = getVar('TEST_TOKEN');

function formatPostForDB(post){
  return {
    "id"          : post.id,
    "message"     : post.message,
    "createdTime" : new Date(post.created_time),
    "updatedTime" : new Date(post.updated_time),
    "fromFbId"    : post.from.id,
    "fromFbName"  : post.from.name
  };
}

function notFromBookstand(message){
  return message.indexOf('bookstand') == -1;
}

function getBooksFromPost(post){
  var books = brain.classifyPostFromText(post.message);
  books.forEach(function(book){
    book.originalPostId  = post.id;
    book.originalMessage = post.message;
    book.createdTime     = new Date(post.created_time);
    book.updatedTime     = new Date(post.updated_time);
    book.fromFbId        = post.from.id;
    book.fromName        = post.from.name;
  });
  return books;
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

function insert(coll, data, cb){
  if (!data.length) return cb(false, coll);
  MongoClient.connect('mongodb://127.0.0.1:27017/bookstand', function(err, db) {
    function done(err, docs) {
      db.close();
      cb(err, coll);
    }
    if (err) {
      return console.log("Error opening database: " + err);
    }
    db.collection(coll).insert(data, done);
  });
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
    posts = _.filter(res.data, function(post){return notFromBookstand(post.message);});
    cb(posts);
  },100);
}

function loopFunction(){
  downloadNewPosts(function(posts){
    var books         = _.map(posts, getBooksFromPost);
    var postsToInsert = _.map(posts, formatPostForDB);
    var booksToInsert = _.flatten(books);
    insert('books', books, insertComplete);
    insert('posts', posts, insertComplete);
  });
}

loopFunction();
