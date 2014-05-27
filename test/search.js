/* jshint -W030 */
var db     = require('../db.js');
var search = require('../search.js');
var should = require('should');
var util   = require('../util.js');
var MongoClient = require('mongodb').MongoClient;

var testCollection = util.getVar('TEST_DB_URI');

describe('search', function(){
  before(function(done){
    MongoClient.connect(testCollection, function(err, db) {
      db.dropDatabase(function(err, _){
        should(err).not.be.ok;
        done();
      });
    });
  });
  it("should find a post", function(done) {
    var post = {
      "createdTime" : "2014-05-27T15:33:59.000Z",
      "fromFbId"    : "10154170318590414",
      "fromFbName"  : "Laura Hamant",
      "id"          : "331733573546962_676072122446437",
      "message"     : "Selling:\nBIBC102 Textbook and Solutions Manual $80 (Principles of Biochemistry, Lehninger, 5th Edition)\n\nCHEM 6B and 6C Texts and Solutions Manual $70 (General Chemistry Volumes II and III, Silberberg, 2nd Edition)\n\nPrices as listed OBO",
      "updatedTime" : "2014-05-27T15:33:59.000Z"
    };

   db.insertColl('posts', [post], function(){
    search.searchPosts({'fromFbId': "10154170318590414"}, function(err, posts){
      posts.length.should.eql(1);
      posts[0].id.should.eql(post.id);
      done();
    }, testCollection);
   }, testCollection);
  });

  it("should find a book", function(done) {
   var book = {
     "author"          : null,
     "buysell"         : "sell",
     "courseNumber"    : "BICD 100",
     "edition"         : null,
     "isbn"            : null,
     "price"           : null,
     "professor"       : null,
     "title"           : "Genetics: Essential of Genetics",
     "originalPostId"  : "331733573546962_675731619147154",
     "originalMessage" : "Selling books: \nBICD 100 Genetics: Essential of Genetics\nBIBC 120 Nutrition: Nutritional Science\nSOCI 1 Introduction to Sociology: Sociology Analysis of the Social World\nand all books for Hum 4.\n\nMessage me for detail and price.",
     "createdTime"     : new Date("2014-05-27T03:26:59Z"),
     "updatedTime"     : new Date("2014-05-27T03:26:59Z"),
     "fromFbId"        : "10152492583703708",
     "fromName"        : "Maggie Chan" 
   };
   db.insertColl('books', [book], function(){
    search.searchBooks({'courseNumber': "BICD 100"}, function(err, books){
      books.length.should.eql(1);
      books[0].originalPostId.should.eql(book.originalPostId);
      done();
    }, testCollection);
   }, testCollection);
  });
});
