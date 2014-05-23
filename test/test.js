/* jshint -W030 */
var brain   = require('../brain');
var app     = require('../server').app;
var util    = require('../util');
var book    = require('../facebook');
var should  = require('should');
var Browser = require('zombie');
var glob    = require('glob');
var fs      = require('fs');

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

function runForFiles(globPath, done, ffun){
  glob(globPath, function(er, filenames){
    filenames.length.should.be.above(0);
    filenames.forEach(function(filename){
      ffun(fs.readFileSync(filename).toString(), filename);
    });
    done();
  });
}

describe('brain', function(){

  it("can figure out what are buys", function(done) {
    runForFiles("test/testData/buysell/buy*", done, function(message){
        brain.classifyBuySell(message)[0].should.equal('buy');
    });
  });

  it("can figure out what are sells", function(done) {
    runForFiles("test/testData/buysell/sell*", done,  function(message){
        brain.classifyBuySell(message)[0].should.equal('sell');
    });
  });

  it("can figure out what are not buys or sells", function(done) {
    runForFiles("test/testData/buysell/notbuysell*", done, function(message){
      should(brain.classifyBuySell(message)).not.be.ok;
    });
  });

  it("can recognize non-ISBNS", function(done) {
    runForFiles("test/testData/isbn/noisbn*", done, function(message){
        brain.extractISBNs(message).length.should.equal(0);
    });
  });

  it("can extract ISBNS", function(done) {
    runForFiles("test/testData/isbn/isbn*", done, function(message, filename){
        var isbn = brain.extractISBNs(message);
        var r = /test\/testData\/isbn\/isbn(\d+)/;
        var m = filename.match(r);
        isbn.length.should.equal(1);
        isbn[0].should.equal(m[1]);
    });
  });

  it("can recognize non-editions", function(done) {
    runForFiles("test/testData/edition/noedition*", done, function(message){
        brain.extractEditions(message).length.should.equal(0);
    });
  });

  it("can extract editions", function(done) {
    runForFiles("test/testData/edition/edition*", done, function(message, filename){
        var editions = brain.extractEditions(message);
        var r = /test\/testData\/edition\/edition(\d+)/;
        var m = filename.match(r);
        editions.length.should.equal(1);
        editions[0].should.equal(m[1]);
    });
  });

  it("can recognize non-prices", function(done) {
    runForFiles("test/testData/price/noprice*", done, function(message){
        brain.extractPrices(message).length.should.equal(0);
    });
  });

  it("can extract prices", function(done) {
    runForFiles("test/testData/price/price*", done, function(message, filename){
        var prices = brain.extractPrices(message);
        var r = /test\/testData\/price\/price(\d+)/;
        var m = filename.match(r);
        prices.length.should.equal(1);
        prices[0].should.equal(m[1]);
    });
  });

  it("can recognize non-titles", function(done) {
    runForFiles("test/testData/title/notitle*", done, function(message){
        brain.extractTitles(message).length.should.equal(0);
    });
  });

  it("can extract titles", function(done) {
    var key = JSON.parse(fs.readFileSync('test/testData/title/key.json'));
    runForFiles("test/testData/title/title*", done, function(message, filename){
        var titles = brain.extractTitles(message);
        var ref = key[filename.split("/").pop()];
        titles.should.eql(ref);
    });
  });

  it("can recognize non-authors", function(done) {
    runForFiles("test/testData/author/noauthor*", done, function(message){
        brain.extractAuthors(message).length.should.equal(0);
    });
  });

  it("can extract authors", function(done) {
    var key = JSON.parse(fs.readFileSync('test/testData/author/key.json'));
    runForFiles("test/testData/author/author*", done, function(message, filename){
        var authors = brain.extractAuthors(message);
        var ref = key[filename.split("/").pop()];
        authors.should.eql(ref);
    });
  });

  it("can recognize non-courses", function(done) {
    runForFiles("test/testData/course/nocourse*", done, function(message){
        brain.extractCourseNumbers(message).length.should.equal(0);
    });
  });

  it("can extract courses", function(done) {
    var key = JSON.parse(fs.readFileSync('test/testData/course/key.json'));
    runForFiles("test/testData/course/course*", done, function(message, filename){
        var courses = brain.extractCourseNumbers(message);
        var ref = key[filename.split("/").pop()];
        courses.should.eql(ref);
    });
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
