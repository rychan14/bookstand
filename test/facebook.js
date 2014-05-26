/* jshint -W030 */
var FB     = require('fb');
var book   = require('../facebook');
var should = require('should');
var util   = require('../util');
describe('facebook', function(){

  before(function(){
    this.testFbGroupId = util.getVar('TEST_TEXTBOOK_GRP_ID');
    this.fbGroupId     = util.getVar('TEXTBOOK_GRP_ID');
    this.fbToken       = util.getVar('TEST_TOKEN');
    this.pubFbToken    = util.getVar('PUBLISH_TEST_TOKEN');
  });

  describe("#getGroupPosts", function(){

    it("should access 20 group posts", function(done){
      book.getGroupPosts(this.fbGroupId, this.fbToken, function(res){
        res.should.be.ok;
        should(res.error).not.ok;
        res.data.length.should.equal(20);
        done();
      });
    });

    it("should access 0 group posts", function(done){
      this.timeout(25);
      book.getGroupPosts(this.fbGroupId, this.fbToken, function(res){
        res.should.be.ok;
        should(res.error).not.ok;
        res.data.length.should.equal(0);
        done();
      }, 0);
    });

    it("should access 99 group posts", function(done){
      this.timeout(5000); // This could take a while
      book.getGroupPosts(this.fbGroupId, this.fbToken, function(res){
        res.should.be.ok;
        should(res.error).not.ok;
        res.data.length.should.equal(99);
        done();
      }, 100); // 100, why?
    });

  });

  describe("#postToGroup", function(){

    it("should create a test post", function(done){
      var content = "Test post please ignore\n" + new Date();
      book.postToGroup(this.testFbGroupId, this.pubFbToken, content, function(res){
        res.should.be.ok;
        should(res.error).not.ok;
        FB.api("/" + res.id, {'fields': ['message']}, function(res){
          res.should.be.ok;
          should(res.error).not.ok;
          res.message.should.eql(content);
          done();
        });
      });
    });

  });

});
