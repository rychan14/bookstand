var MongoClient = require('mongodb').MongoClient;
var util        = require('./util.js');

function insertColl(coll, data, cb, dbUri){
  if (typeof db === undefined) {
    dbUri = util.getVar('BS_DB_URI');
  }
  if (!data.length) return cb(false, coll);
  MongoClient.connect(dbUri, function(err, db) {
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

module.exports = {
  insertColl: insertColl
};
