var util   = require('../util');
var should = require('should');

describe('util', function(){
  describe('#getVar()', function(){

     it('should return a numeric value for FB_APP_ID', function(){
       var re = /^\d+$/;
       re.test(util.getVar('FB_APP_ID')).should.eql(true);
     });

     it('should return a numeric value for TEXTBOOK_GRP_ID', function(){
       var re = /^\d+$/;
       re.test(util.getVar('TEXTBOOK_GRP_ID')).should.eql(true);
     });

     it('should return a numeric value for TEST_TEXTBOOK_GRP_ID', function(){
       var re = /^\d+$/;
       re.test(util.getVar('TEST_TEXTBOOK_GRP_ID')).should.eql(true);
     });


     it('should return an alphanumeric value for FB_SECRET', function(){
       var re = /^\w+$/;
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
