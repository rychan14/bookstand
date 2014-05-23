var book   = require('./facebook');
var glob   = require('glob');
var fs     = require('fs');
var getVar = require('./util').getVar;
var _      = require('underscore');
var colors = require('colors');
var util   = require('util');

var fbGroupId = getVar('TEXTBOOK_GRP_ID');
var fbToken   = getVar('TEST_TOKEN');

var fields = ['author',
              'buysell',
              'condition',
              'edition',
              'course_name',
              'course_number',
              'isbn',
              'price',
              'professor',
              'title'];

function classifyBuySell(post){
  var buyRegex  = /buy.*?\b/i;
  var sellRegex = /sell.*?\b/i;
  var b         = buyRegex.exec(post);
  if (b) {
    return ['buy', b.index];
  }
  var s = sellRegex.exec(post);
  if (s) {
    return ['sell', s.index];
  }
  return null;
}

function extractISBNs(post) {
  var isbnRegex = /\b((?:97[89])?\d{9}[\dx])\b/ig;
  return post.match(isbnRegex) || [];
}

function extractEditions(post) {
  var editionRegex = /(\d+)(st|nd|rd|th)?( )*edition/ig;
  var results = [];
  var t;
  while ( (t = editionRegex.exec(post)) !== null){
    results.push(t[1]);
  }
  return results;
}

function extractPrices(post) {
  var priceRegex = /\$((\d+)(\.\d*)?)/g;
  var results = [];
  var t;
  while ( (t = priceRegex.exec(post)) !== null){
    results.push(t[1]);
  }
  return results;
}

function classifyPostFromText(post){
  var bs = classifyBuySell(post);
  if (!bs) return [];

  var buysell  = bs[0];
  var isbns    = extractISBNs(post);
  var editions = extractEditions(post);

  if (isbns.length > 0) {
    return _.map(isbns, function(isbn){
      return {"isbn": isbn, "buysell": buysell};
    });
  } else {
    return [{"buysell": buysell}];
  }
}

function compareTokens(classBooks, referenceBooks){
  classTokens     = [];
  referenceTokens = [];
  extraTokens     = [];
  matched         = [];
  fields.forEach(function(field){
    classBooks.forEach(function(book){
      if (field in book){
        classTokens.push(book[field]);
      }
    });
    referenceBooks.forEach(function(book){
      if (field in book){
        referenceTokens.push(book[field]);
      }
    });
  });
  classTokens.forEach(function(token){
    var refIndex = referenceTokens.indexOf(token);
    if (refIndex != -1){
      referenceTokens.splice(refIndex, 1);
      matched.push(tokens);
    } else {
      extraTokens.push(token);
    }
  });
  return {
    "matched"      : matched,
    "classnExtra"  : extraTokens,
    "classnMissed" : referenceTokens
  };
}

function sameFields(classn, reference) {
  return fields.filter(function(field){
    return classn[field] == reference[field];
  });
}

function bestMatch(classn, references) {
  if (typeof(references) === 'undefined') return null;
  return _.max(references, function(ref){ return sameFields(classn, ref).length; });
}

function grade(classns, refs) {
  var results = {matched: [], classnExtra: [], classnMissed: [], 
                difference: refs.length - classns.length };
  classns.forEach(function(classn){
      var ref = bestMatch(classn, refs);
      if (!ref) {
        results.classnExtra.push(classn);
      } else {
        var fields = sameFields(classn, ref);
        if (!fields) {
          results.classnExtra.push(classn);
        } else {
          results.matched.push({classn: classn, ref: ref, matched: fields});
        }
        refs.splice(refs.indexOf(ref), 1);
      }
  });
  return results;
}

function isGood(gradeResults) {
  return gradeResults.classnExtra.length  === 0 &&
         gradeResults.classnMissed.length === 0 &&
         gradeResults.difference          === 0;
}

function testClassifier(){
  glob("train/*.message", function(er, files) {
    var success = 0;
    var fails   = 0;
    files.forEach(function(file){
      // Do something here
      var ref = file + ".ref";
      if (!fs.existsSync(ref)){
        console.log("Manual classification for " + file + " has not been performed.");
      } else {
        var message        = fs.readFileSync(file).toString();
        var classification = classifyPostFromText(message);
        var reference      = JSON.parse(fs.readFileSync(ref));
        console.log("For " + colors.blue(file) + ": " );
        console.log(colors.grey(message));
        console.log("Classification: ");
        console.log(classification);
        console.log("Results: ");
        var graded = grade(classification, reference);
        if (isGood(graded)){
          success++;
          console.log("Classification Success".green);
        } else {
          console.log("Classification Failed, Results: ".red);
          console.log(JSON.stringify(graded, undefined, 2));
          fails++;
        }
        console.log("------------------------------\n");
      }
    });
    console.log(colors.green(success + " successes"));
    if (!fails) {
      console.log("No Failures!".green);
    } else {
      console.log(colors.red(fails + " failures"));
    }
  });
}

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

module.exports = {
  'classifyBuySell'  : classifyBuySell,
  'classifyPost'     : classifyPostFromText,
  'extractISBNs'     : extractISBNs,
  'extractEditions'  : extractEditions,
  'extractPrices'    : extractPrices,
  'generateTestData' : generateTestData,
  'testClassifier'   : testClassifier
};
