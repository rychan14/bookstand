var book = require('./facebook');
var fs   = require('fs');
var util = require('./util');

var fbGroupId = util.getVar('TEXTBOOK_GRP_ID');
var fbToken   = util.getVar('TEST_TOKEN');

function generateTestData(num_posts){
  book.getGroupPosts(fbGroupId, fbToken, function(res){
    var d = res.data;
    for (var i = 0; i < d.length; i++) {
      var filename = 'train/' + d[i].id + ".message";
      console.log(filename);
      fs.writeFile('train/' + d[i].id + ".message", d[i].message + '\n');
    }
  }, num_posts);
}

module.exports = {'generateTestData': generateTestData};
