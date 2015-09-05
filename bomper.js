#!/usr/bin/env node
'use strict';

// NPM modules
var program = require('commander'),
    open    = require('open');

// Browser bookmark modules
var safari = require('./browsers/safari'),
    chrome = require('./browsers/chrome');

program
  .version(require('./package.json').version)
  .usage('[options] <bookmark name>')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}

var bookmarks;

// Gather all bookmarks from all browsers
chrome
  .osx()
  .then(function (o) {
    bookmarks = o;
    return safari.osx();
  })
  .then(function (o) {
    bookmarks = bookmarks.concat(o);

    // Now search
    var search = process.argv.slice(2).join(' ');

    var url = bookmarks.reduce(function (acc, bm) {
      if (bm.name.toLowerCase().indexOf(search) >= 0) {
        return bm.url;
      } else {
        return acc;
      }
    }, false);

    if (!url) console.log('No bookmark found matching "' + search + '"');
    else      open(url);
  });
