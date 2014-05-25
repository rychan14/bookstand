var conn = new Mongo();
var db   = conn.getDB('bookstand');
var indexOptions = {'dropDups': true, 'unique': true, 'sparse': true};
db.posts.ensureIndex({'originalPostId': 1}, indexOptions);
db.books.ensureIndex({'originalPostId': 1}, indexOptions);
