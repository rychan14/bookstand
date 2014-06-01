var listener = require('../listener.js');
var should   = require('should');
describe('listener', function(){
  describe ("#formatPostForDB", function() {
    it('should format post for db', function(){
      var post = {
        id           : '331733573546962_673182472735402',
        from         : {id: '10203791314726036', name: 'Laurel Kistler'},
        message      : 'Buying: Math 10A/B/C with maple leaf cover',
        created_time : '2014-05-23T16:58:42+0000',
        updated_time : '2014-05-26T15:07:02+0000'
      };
      var formatted = {
        id          : '331733573546962_673182472735402',
        message     : 'Buying: Math 10A/B/C with maple leaf cover',
        createdTime : new Date("Fri May 23 2014 09:58:42 GMT-0700 (PDT)"),
        updatedTime : new Date("Mon May 26 2014 08:07:02 GMT-0700 (PDT)"),
        fromFbId    : '10203791314726036',
        fromFbName  : 'Laurel Kistler' };
      listener.formatPostForDB(post).should.eql(formatted);
    });
  });

  describe ("#associateBookWithPost", function() {
    it('should add post data to a book', function(){
      var book = {
        author       : undefined,
        buysell      : 'buy',
        courseNumber : 'Math 10A',
        edition      : undefined,
        isbn         : undefined,
        price        : undefined,
        professor    : undefined,
        title        : undefined
      };
      var post = {
        id           : '331733573546962_673182472735402',
        from         : { id: '10203791314726036', name: 'Laurel Kistler' },
        message      : 'Buying: Math 10A/B/C with maple leaf cover',
        created_time : '2014-05-23T16:58:42+0000',
        updated_time : '2014-05-26T15:07:02+0000'
      };
      var associated = {
        author         : undefined,
        buysell        : 'buy',
        courseNumber   : 'Math 10A',
        edition        : undefined,
        isbn           : undefined,
        price          : undefined,
        professor      : undefined,
        title          : undefined,
        originalPostId : '331733573546962_673182472735402',
        message        : 'Buying: Math 10A/B/C with maple leaf cover',
        createdTime    : new Date("Fri May 23 2014 09:58:42 GMT-0700 (PDT)"),
        updatedTime    : new Date("Mon May 26 2014 08:07:02 GMT-0700 (PDT)"),
        fromFbId       : '10203791314726036',
        fromName       : 'Laurel Kistler'
      };
      listener.associateBookWithPost(book, post).should.eql(associated);
    });
  });

  describe ("#getBooksFromPost", function() {
    it('should get books from a post', function(){
      var post = {
        id           : '331733573546962_673635419356774',
        from         : { id: '847591698589693', name: 'Trang Tang' },
        message      : 'BUYING: Advanced Calculus, 2 Edition, 9780821847916 by Fitzpatrick',
        created_time : '2014-05-24T06:46:56+0000',
        updated_time : '2014-05-26T01:28:28+0000'
      };
      var books = [ {
        author         : 'Fitzpatrick',
        buysell        : 'buy',
        courseNumber   : undefined,
        edition        : '2',
        isbn           : '9780821847916',
        price          : undefined,
        professor      : undefined,
        title          : 'Advanced Calculus',
        originalPostId : '331733573546962_673635419356774',
        message        : 'BUYING: Advanced Calculus, 2 Edition, 9780821847916 by Fitzpatrick',
        createdTime    : new Date("Fri May 23 2014 23:46:56 GMT-0700 (PDT)"),
        updatedTime    : new Date("Sun May 25 2014 18:28:28 GMT-0700 (PDT)"),
        fromFbId       : '847591698589693',
        fromName       : 'Trang Tang'
      } ];
      listener.getBooksFromPost(post).should.eql(books);
      });
    });

  describe ("#notFromBookstand", function() {
    it('return true for messages not from bookstand', function(){
      listener.notFromBookstand("This post is not from bookstand").should.equal(true);
      listener.notFromBookstand("").should.equal(true);
    });
    it('return false for messages from bookstand', function(){
      listener.notFromBookstand("Foo Bar\nSent from bookstand.").should.equal(false);
    });
  });
});
