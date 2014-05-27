var db = require('./db.js');

function searchBooks(query, cb, dbUri){
  return db.find('books', query, [], {'sort': {'createdTime': 1}, 'limit': 20}, cb, dbUri);
}

function searchPosts(query, cb, dbUri){
  return db.find('posts', query, [], {'sort': {'createdTime': 1}, 'limit': 20}, cb, dbUri);
}

module.exports = {
  searchBooks: searchBooks,
  searchPosts: searchPosts
};
