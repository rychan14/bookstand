/* jshint -W030 */
var db     = require('../db.js');
var should = require('should');
var util   = require('../util');

describe('db', function() {
  before(function(){
    this.dbUri = util.getVar('TEST_DB_URI');
  });
  describe("#insertColl", function(){
   it('should be able to insert an empty collection', function(done){
    db.insertColl('testCol', [], function(err, docs){
      should(err).not.be.ok;
      done();
    }, this.dbUri);
   });
   it('should be able to insert some values', function(done){
    db.insertColl('testCol', [{'a': 'foo', 'b': 'bar'}], function(err, docs){
      should(err).not.be.ok;
      // TODO: Actually perform this check once other DB features are added.
      done();
    }, this.dbUri);
   });
  });
});
