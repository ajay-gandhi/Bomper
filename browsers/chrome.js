'use strict';

/**
 * Exports functions for retrieving Chrome bookmarks
 */

var fs      = require('fs'),
    Promise = require('es6-promise').Promise;

// Gets all bookmarks for Chrome on OS X
var get_bookmarks = function (os) {

  var bm_bases = {
    'osx':   process.env['HOME'],
    'linux': process.env['HOME']
  }

  var bm_paths = {
    'osx':   '/Library/Application Support/Google/Chrome/Default/Bookmarks',
    'linux': '/.config/google-chrome/Default/Bookmarks'
  }

  var bm_path = bm_bases[os] + bm_paths[os];

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

// Export the function
module.exports['darwin'] = function () { return get_bookmarks('osx');   };
module.exports['linux']  = function () { return get_bookmarks('linux'); };

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
