#!/usr/bin/env node
'use strict';

// NPM modules
var program  = require('commander'),
    open     = require('open'),
    Inquirer = require('inquirer');

// Browser bookmark modules
var safari = require('./browsers/safari'),
    chrome = require('./browsers/chrome');

program
  .version(require('./package.json').version)
  .usage('[bookmark name]')
  .on('--help', function () {
    console.log('  Examples:');
    console.log('');
    console.log('    $ bomper         # display bookmark prompt');
    console.log('    $ bomper gmail   # open "gmail" bookmark');
    console.log('');
  })
  .parse(process.argv);

var bookmarks;

// Gather all bookmarks from all browsers
chrome
  .osx()
  .then(function (o) {
    // Store chrome bookmarks
    bookmarks = o;
    return safari.osx();
  })
  .then(function (o) {

    // Display inquirer prompt
    if (!process.argv.slice(2).length) {
      // Add separators
      bookmarks.unshift(new Inquirer.Separator('Chrome'));
      bookmarks.push(new Inquirer.Separator('Safari'));

      // Add safari bookmarks
      bookmarks = bookmarks.concat(o);

      // Display inquirer prompt of all bookmarks
      Inquirer.prompt({
        type:    'list',
        name:    'which',
        message: 'Which bookmark would you like to open?',
        choices: bookmarks
      }, function (answers) {
        open(answers.which);
      });

    } else {
      // Open the given search bookmark
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
    }
  });
