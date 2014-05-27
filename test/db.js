/* jshint -W030 */
var db     = require('../db.js');
var should = require('should');
var util   = require('../util');
var _      = require('underscore');

describe('db', function() {
  var dbUri = util.getVar('TEST_DB_URI');
  var start = Date.now();

  before(function(done){
    toInsert = [];
    for (var i = 0; i < 5; i++){
      toInsert.push({index: i, date: new Date(start + i)});
    }
    db.insertColl('testFindCol', _.shuffle(toInsert), function(err, docs){
      should(err).not.be.ok;
      done();
    }, dbUri);
  });

  describe("#find", function(){
    it('should be able to sort results', function(done) {
      db.find('testFindCol',
              {},
              ['index'],
              {sort: {"date": -1}, limit: 5}, function(err, docs){
      should(err).not.be.ok;
      _.pluck(docs, 'index').should.eql([4,3,2,1,0]);
      done();
      }, dbUri);
    });

    it('should be able to limit results', function(done) {
      db.find('testFindCol',
              {},
              ['index', 'date'],
              {sort: {"date": -1}, limit: 3}, function(err, docs){
        should(err).not.be.ok;
        _.pluck(docs, 'date').should
        .eql([new Date(start+4),new Date(start+3),new Date(start+2)]);
        done(); }, dbUri);
    });

    it('should be able to get results after a certain date', function(done){
      db.find('testFindCol',
              {'date': {'$gte': new Date(start)}},
              ['index', 'date'],
              {sort: {"date": -1}}, function(err, docs){
        should(err).not.be.ok;
        _.pluck(docs, 'index').should.eql([4,3,2,1,0]);
        done(); }, dbUri);
    });
  });
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
      db.find('testCol', {'date': date}, ['date'], {}, function(err, docs){
        should(err).not.be.ok;
        docs[0].date.should.eql(date);
        done();
      }, dbUri);
    }, dbUri);
   });

   it('should be able to insert multiple vals', function(done){
    var c = Date.now();
    db.insertColl('testCol', [{'c': c}, {'c': c+1}], function(err, docs){
      should(err).not.be.ok;
      db.find('testCol', {'c': {"$gte": c}}, ['c'], {'sort': {'c': 1}}, function(err, docs){
        should(err).not.be.ok;
        docs.length.should.eql(2);
        docs[0].c.should.eql(c);
        docs[1].c.should.eql(c+1);
        done();
      }, dbUri);
    }, dbUri);
   });

  });
});
