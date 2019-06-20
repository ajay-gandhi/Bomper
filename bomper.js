#!/usr/bin/env node
'use strict';

// NPM modules
const program = require('commander');
const os = require('os').platform();
const open = require('open');
const inquirer = require('inquirer');

// Browser bookmark modules
const safari = require('./browsers/safari');
const chrome = require('./browsers/chrome');

program
  .version(require('./package.json').version)
  .usage('[bookmark name]')
  .on('--help', () => {
    console.log('  Examples:');
    console.log('');
    console.log('    $ bomper         # display bookmark prompt');
    console.log('    $ bomper gmail   # open "gmail" bookmark');
    console.log('');
  })
  .parse(process.argv);

let bookmarks;

chrome[os]()
  .then((chromeBookmarks) => {
    // Store chrome bookmarks
    bookmarks = chromeBookmarks;
    return safari[os]();
  })
  .then((safariBookmarks) => {
    // Display inquirer prompt
    if (!program.args.length) {
      // Add separators
      bookmarks.unshift(new inquirer.Separator('Chrome'));
      bookmarks.push(new inquirer.Separator('Safari'));

      // Add safari bookmarks
      bookmarks = bookmarks.concat(safariBookmarks);

      // Display inquirer prompt of all bookmarks
      inquirer.prompt({
        type:    'list',
        name:    'which',
        message: 'Which bookmark would you like to open?',
        choices: bookmarks,
      })
      .then(answers => open(answers.which));
    } else {
      // Open the given search bookmark
      bookmarks = bookmarks.concat(safariBookmarks);

      // Now search
      var search = program.args.join(' ');

      var url = bookmarks.reduce((memo, bm) => {
        return bm.name.toLowerCase().includes(search) ? bm.value : memo;
      }, false);

      if (!url) console.log('No bookmark found matching "' + search + '"');
      else      open(url);
    }
  });
