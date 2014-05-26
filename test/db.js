/* jshint -W030 */
var db     = require('../db.js');
var should = require('should');
var util   = require('../util');

describe('db', function() {
  var dbUri = util.getVar('TEST_DB_URI');
  describe("#insertColl", function(){

   it('should be able to insert an empty collection', function(done){
    db.insertColl('testCol', [], function(err, docs){
      should(err).not.be.ok;
      done();
    }, dbUri);
   });

   it('should be able to insert a value', function(done){
    var date = new Date();
    db.insertColl('testCol', [{'date': date}], function(err, docs){
      should(err).not.be.ok;
      db.find('testCol', {'date': date}, {}, function(err, docs){
        should(err).not.be.ok;
        docs[0].date.should.eql(date);
        done();
      }, dbUri);
    }, dbUri);
   });

  });
});
