/* jshint -W030 */
var app      = require('../server').app;
var listener = require('../listener.js');
var should   = require('should');
var Browser  = require('zombie');

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


