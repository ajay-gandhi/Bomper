#!/usr/bin/env node

// NPM modules
var program = require('commander'),
    open    = require('open');

// Browser bookmark modules
var safari = require('./browsers/safari');

program
  .version(require('./package.json').version)
  .usage('[options] <bookmark name>')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}

safari
  .osx()
  .then(function (o) {
    var search = process.argv.slice(2).join(' ');

    var url = o.reduce(function (acc, bm) {
      if (bm.name.toLowerCase().indexOf(search) >= 0) {
        return bm.url;
      } else {
        return acc;
      }
    }, '');

    open(url);
  });
