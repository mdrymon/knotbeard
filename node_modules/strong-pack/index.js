'use strict';

var debug = require('debug')('strong-pack');
var path = require('path');
var tar = require('tar-fs');

module.exports = exports = pack;

var FILTER = filterize([
  '.git',
  'CVS',
  '.svn',
  '.hg',
  '.lock-wscript',
  /^\.wafpickle-[0-9]+$/,
  /^\..*\.swp$/,
  '.DS_Store',
  /^\._/,
]);

function pack(folder) {
  var tarPack = tar.pack(folder, {
    ignore: FILTER,
    map: function(header) {
      if (header.name === '.') {
        header.name = 'package';
      } else {
        header.name = 'package/' + header.name;
      }
      return header;
    },
  });
  if (debug.enabled) {
    tarPack.on('error', debug.bind(null, 'tar creation error'));
  }
  return tarPack;
}

function filterize(patterns) {
  patterns = patterns.map(testable);
  return filter;
  function filter(entry) {
    var basename = path.basename(entry);
    return patterns.some(function(p) { return p.test(basename); });
  }
  function testable(pattern) {
    if (pattern instanceof RegExp) {
      return pattern;
    }
    return new RegExp('^' + pattern + '$');
  }
}
