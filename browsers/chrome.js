'use strict';

/**
 * Exports functions for retrieving Chrome bookmarks
 */

var fs      = require('fs'),
    Promise = require('es6-promise').Promise;

module.exports.osx = function () {
  // Location of bookmarks file
  var bm_path = process.env['HOME'];
      bm_path += '/Library/Application Support/Google/Chrome/Default/Bookmarks';

  return new Promise(function (resolve) {
    fs.readFile(bm_path, function(err, data) {
      if (err) {
        // If file not found, just return empty
        if (err.code === 'ENOENT') resolve([]);

        // Legit error
        else                       throw err;
      }

      var bm_data = JSON.parse(data.toString()).roots;

      // Top level are objects, then arrays
      var bm_array = Object.keys(bm_data).reduce(function (acc, key) {
        var bm = bm_data[key];

        if (bm.children) return acc.concat(parse_bookmarks_json(bm.children));
        else             return acc;
      }, []);

      resolve(bm_array);
    });
  });
}

/**
 * Recursively adds folders of bookmarks to one big array
 */
var parse_bookmarks_json = function (arr) {
  return arr.reduce(function (acc, e) {
    if (e.type === 'url') {
      // Bookmark
      return acc.concat({
        name:  e.name,
        value: e.url
      });

    } else if (e.type === 'folder') {
      // Folder, recurse
      return acc.concat(parse_bookmarks_json(e.children));

    } else {
      return acc;
    }
  }, []);
}
