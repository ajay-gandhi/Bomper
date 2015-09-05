
var bplist  = require('bplist-parser'),
    Promise = require('es6-promise').Promise;

module.exports.osx = function () {
  var bm = process.env['HOME'] + '/Library/Safari/Bookmarks.plist';

  return new Promise(function (resolve, reject) {
    bplist.parseFile(bm, function(err, obj) {
      if (err) throw err;

      var bookmarks = parse_bookmarks_plist(obj[0]);

      resolve(bookmarks);
    });
  });
}

var parse_bookmarks_plist = function (o) {
  if (o.Children) {
    return o.Children.reduce(function (acc, child) {

      if (child.WebBookmarkType === 'WebBookmarkTypeLeaf') {
        return acc.concat({
          name: child.URIDictionary.title,
          url:  child.URLString
        });

      } else if (child.WebBookmarkType === 'WebBookmarkTypeList') {
        return acc.concat(parse_bookmarks_plist(child));

      } else {
        return acc;
      }

    }, []);

  } else {
    return [];
  }
}
