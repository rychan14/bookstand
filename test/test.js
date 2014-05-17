/* jshint -W030 */ 
var app     = require('../server').app;
var util    = require('../util');
var book    = require('../facebook');
var should  = require('should');
var Browser = require('zombie');

describe('util', function(){
  describe('#getVar()', function(){

     it('should return a numeric value for FB_APP_ID', function(){
       var re = /^[0-9]+$/;
       re.test(util.getVar('FB_APP_ID')).should.eql(true);
     });

     it('should return an alphanumeric value for FB_SECRET', function(){
       var re = /^[0-9a-zA-Z]+$/;
       re.test(util.getVar('FB_APP_ID')).should.eql(true);
     });

     it('should return a server url that starts with http://', function(){
       util.getVar('SERVER_URL').should.startWith('http://');
     });

     it('should return a string for SESSION_SECRET', function(){
       util.getVar('SESSION_SECRET').should.be.type('string');
     });

     it('should throw an exception for keys that don\'t exist', function(){
       (function(){util.getVar('SUPER_UNLIKELY_KEY');})
       .should.throw('SUPER_UNLIKELY_KEY environment variable is not defined');
     });
  });
});

describe('/auth/facebook', function(){
  before(function(){
    this.server = app.listen(3000);
    this.browser = new Browser({site:'http://localhost:3000'});
  });

  before(function(done){ 
    this.browser.visit('/auth/facebook', done);
  });

  it('should redirect', function() {
    this.browser.url.should.startWith('https://www.facebook.com/login.php');
    return this.browser.success.should.be.ok;
  });

  after(function(done) {
    this.server.close(done);
  });

});

describe('facebook', function(){

  before(function(){
    this.fbGroupId = util.getVar('TEXTBOOK_GRP_ID');
    this.fbToken   = util.getVar('TEST_TOKEN');
  });

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

  it("should access 200 group posts", function(done){
    this.timeout(5000); // This could take a while
    book.getGroupPosts(this.fbGroupId, this.fbToken, function(res){
      res.should.be.ok;
      should(res.error).not.ok;
      res.data.length.should.equal(200);
      done();
    }, 200);
  });

});

describe('home', function(){
  before(function(){
    this.server = app.listen(3000);
    this.browser = new Browser({site:'http://localhost:3000'});
  });

  before(function(done){ 
    this.browser.visit('/', done);
  });

  it('should show login', function() {
    this.browser.text().should.containEql('Login');
    return this.browser.success.should.be.ok;
  });

  after(function(done) {
    this.server.close(done);
  });

});
