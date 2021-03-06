'use strict';

/**
 * Exports functions for retrieving Safari bookmarks
 */

var bplist  = require('bplist-parser'),
    Promise = require('es6-promise').Promise;

// Gets bookmarks from Safari on OS X
module.exports['darwin'] = function () {
  var bm = process.env['HOME'] + '/Library/Safari/Bookmarks.plist';

  return new Promise(function (resolve) {
    bplist.parseFile(bm, function(err, obj) {
      if (err) {
        // If file not found, just return empty
        if (err.code === 'ENOENT') resolve([]);

        // Legit error
        else                       throw err;
      }

      var bookmarks = parse_bookmarks_plist(obj[0]);

      resolve(bookmarks);
    });
  });
}

// No such thing as Safari on linux, generally
module.exports['linux'] = function () {
  return [];
}

/**
 * Recursively adds bookmarks from all subfolders to one big array
 */
var parse_bookmarks_plist = function (o) {
  if (o.Children) {
    return o.Children.reduce(function (acc, child) {

      // Bookmark
      if (child.WebBookmarkType === 'WebBookmarkTypeLeaf') {
        return acc.concat({
          name:  child.URIDictionary.title,
          value: child.URLString
        });

      } else if (child.WebBookmarkType === 'WebBookmarkTypeList') {
        // Folder, recurse
        return acc.concat(parse_bookmarks_plist(child));

      } else {
        return acc;
      }

    }, []);

  } else {
    return [];
  }
}
