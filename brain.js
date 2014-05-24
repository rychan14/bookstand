var book   = require('./facebook');
var glob   = require('glob');
var fs     = require('fs');
var getVar = require('./util').getVar;
var _      = require('underscore');
var colors = require('colors');
var util   = require('util');

var fbGroupId = getVar('TEXTBOOK_GRP_ID');
var fbToken   = getVar('TEST_TOKEN');

var deptAcronyms = JSON.parse(fs.readFileSync('./data/dept_acronyms')).depts;

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
  var sellRegex = /(sell.*?\b|don't need)/i;
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

function classifyPostFromText(post){
  var bs = classifyBuySell(post);
  if (!bs) return [];
  var buysell = bs[0];
  content     = post.substr(bs[1]);

  var authors       = extractAuthors(content);
  var courseNumbers = extractCourseNumbers(content);
  var editions      = extractEditions(content);
  var isbns         = extractISBNs(content);
  var prices        = extractPrices(content);
  var professors    = extractProfessors(content);
  var titles        = extractTitles(content);

  var numItems = _.max([authors.length,
                        courseNumbers.length,
                        editions.length,
                        isbns.length,
                        prices.length,
                        professors.length,
                        titles.length]);
  var results = [];
  for(var i = 0; i < numItems; i++){
    results.push({
      "author"       : authors[i],
      "buysell"      : buysell,
      "courseNumber" : courseNumbers[i],
      "edition"      : editions[i],
      "isbn"         : isbns[i],
      "price"        : prices[i],
      "professor"    : professors[i],
      "title"        : titles[i]
    });
  }

  return results;
}

function extractAuthors(post) {
  var authorRegex = /((^(a-z))+\s)?([a-z]+[\w, ]*) by ([a-z]{2}[a-z\. ]*)/ig;
  var results = [];
  while ( (t = authorRegex.exec(post)) !== null) results.push(t[5].trim());
  return results;
}

function extractCourseNumbers(post) {
  var deptRegex =
    new RegExp('\\b((' + deptAcronyms.join("|") + ')( )?\\d{1,3}[a-z]{0,3})', 'ig');
  var results = [];
  while ( (t = deptRegex.exec(post)) !== null) results.push(t[0]);
  return results;
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

function extractISBNs(post) {
  var isbnRegex = /\b((?:97[89])?\d{9}[\dx])\b/ig;
  return post.match(isbnRegex) || [];
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

function extractProfessors(post) {
  var professorRegex = /(^(a-z))*([a-z]+[\w, ]*) for ([a-z]{2}[a-z\. ]*)/ig;
  var results = [];
  while ( (t = professorRegex.exec(post)) !== null) results.push(t[4].trim());
  return results;
}


function extractTitles(post) {
  // It would be better to use a Markov model probably, these are just heuristics
  var regexes = [
    [/(^(a-z))*([a-z]+[a-z ]*)(, )*(\d+)(st|nd|rd|th)?( )*edition/ig, 3],
    [/(^(a-z))*([a-z]+[\w ]*) (by|for) [a-z]{2}.*/ig, 3],
    [/(^(a-z))*([a-z]+[\w ]* (vo|vol|volume)\.? \d+).*/ig, 3]
  ];
  var results = [];
  regexes.forEach(function(regex){
    while ( (t = regex[0].exec(post)) !== null){
      results.push(t[regex[1]].trim());
    }
  });
  return results;
}

////////////////////////////////////
/// Grading Code
///////////////////////////////////

function sameFields(classn, reference) {
  return fields.filter(function(field){
    return classn[field] == reference[field];
  });
}

function differentFields(classn, reference) {
  return fields.filter(function(field){
    return classn[field] != reference[field];
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
          var diffFields = differentFields(classn, ref);
          results.matched.push({classn: classn, ref: ref, different: diffFields});
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
    var skips   = 0;
    files.forEach(function(file){
      // Do something here
      var ref = file + ".ref";
      if (!fs.existsSync(ref)){
        console.log("Manual classification for " + file + " has not been performed.");
      } else {
        var message        = fs.readFileSync(file).toString();
        var classification = classifyPostFromText(message);
        var reference      = JSON.parse(fs.readFileSync(ref));
        var graded         = grade(classification, reference);
        var skip           = file.substr('skip') === 0;
        if (!skip){
          if (isGood(graded)){
            console.log(colors.green(file+": success"));
            success++;
          } else {
            console.log("------------------------------\n");
            console.log(colors.red(file+": failure"));
            console.log(colors.grey(message));
            console.log("Classification: ");
            console.log(classification);
            console.log(JSON.stringify(graded, undefined, 2));
            fails++;
            console.log("------------------------------\n");
          }
        } else {
          if (isGood(graded)){
            console.log(colors.red(file+": succeeded, but it should have failed!"));
            fails++;
          } else {
            console.log(colors.blue(file+": skipped"));
            skips++;
          }
        }
      }
    });
    console.log(colors.green(success + " succeeded."));
    console.log(colors.blue(skips + " skipped."));
    if (!fails) {
      console.log(colors.green("0 failed."));
    } else {
      console.log(colors.red(fails + " failed."));
    }
  });
}

function generateTestData(num_posts){
  toSkip = fs.readFileSync('train/skip').toString();
  book.getGroupPosts(fbGroupId, fbToken, function(res){
    var d = res.data;
    for (var i = 0; i < d.length; i++) {
      if (toSkip.indexOf(d[i].id) !== -1) continue;
      var filename = 'train/' + d[i].id + ".message";
      console.log(filename);
      fs.writeFile('train/' + d[i].id + ".message", d[i].message + '\n');
    }
  }, num_posts);
}

module.exports = {
  'classifyBuySell'      : classifyBuySell,
  'classifyPostFromText' : classifyPostFromText,
  'grade'                : grade,
  'isGood'               : isGood,
  'extractISBNs'         : extractISBNs,
  'extractEditions'      : extractEditions,
  'extractPrices'        : extractPrices,
  'extractTitles'        : extractTitles,
  'extractAuthors'       : extractAuthors,
  'extractProfessors'    : extractProfessors,
  'extractCourseNumbers' : extractCourseNumbers,
  'generateTestData'     : generateTestData,
  'testClassifier'       : testClassifier
};
