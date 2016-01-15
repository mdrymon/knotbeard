'use strict';

var pack = require('../');
var path = require('path');
var tar = require('tar');
var test = require('tap').test;

var ignoredAppRoot = path.join(__dirname, 'fixtures', 'ignored-app');
var ignoredAppFiles = [
  'package',
  'package/.gitignore',
  'package/.npmignore',
  'package/node_modules',
  'package/node_modules/.bin',
  'package/node_modules/.bin/foo',
  'package/node_modules/foo',
  'package/node_modules/foo/.gitignore',
  'package/node_modules/foo/.npmignore',
  'package/node_modules/foo/cmd.js',
  'package/node_modules/foo/node_modules',
  'package/node_modules/foo/node_modules/bar',
  'package/node_modules/foo/node_modules/bar/.gitignore',
  'package/node_modules/foo/node_modules/bar/.npmignore',
  // this is where bar/.svn/entries would be if it wasn't ignored
  'package/node_modules/foo/node_modules/bar/index.js',
  'package/node_modules/foo/node_modules/bar/package.json',
  'package/node_modules/foo/package.json',
  'package/package.json',
];

test('returns a tar stream of everything', function(t) {
  visit.paths = [];

  return pack(ignoredAppRoot).pipe(tar.Parse())
    .on('error', t.ifErr)
    .on('entry', visit)
    .on('end', verify);

  function visit(entry) {
    visit.paths.push(entry.path);
  }

  function verify() {
    t.same(visit.paths.sort(), ignoredAppFiles, 'all expected paths present');
    t.end();
  }
});
