var db = require('db.js');
function searchBooks(query, cb, dbUri){
  if (typeof dbUri === 'undefined') {
    dbUri = util.getVar('BS_DB_URI');
  }
}
