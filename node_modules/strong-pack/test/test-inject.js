'use strict';

var concat = require('concat-stream');
var fs = require('fs');
var pack = require('../');
var path = require('path');
var tar = require('tar');
var test = require('tap').test;

var ignoredAppRoot = path.join(__dirname, 'fixtures', 'ignored-app');
var expectedFiles = [
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
  'package/node_modules/foo/node_modules/bar/index.js',
  'package/node_modules/foo/node_modules/bar/package.json',
  'package/node_modules/foo/package.json',
  'package/package.json',
  'package/.injected.json',
  'package2/.injected.json',
].sort();

test('ensure injected file does not exist', function(t) {
  t.ok(!fs.existsSync(path.resolve(ignoredAppRoot, '.injected.json')));
  t.end();
});

test('tar stream with injected file', {todo: false}, function(t) {
  var injectedPath = '.injected.json';
  var injectedContent = JSON.stringify({
    key1: 'value1',
    json: true,
  });
  var actualFiles = {};
  var tarPack = pack(ignoredAppRoot);
  tarPack.entry({name: 'package/' + injectedPath}, injectedContent);
  tarPack.entry({name: 'package2/' + injectedPath}, injectedContent);

  return tarPack.pipe(tar.Parse())
    .on('error', t.ifErr)
    .on('entry', visit)
    .on('end', verify);

  function visit(entry) {
    actualFiles[entry.path] = true;
    if (entry.path === 'package/' + injectedPath) {
      entry.pipe(concat(function(d) {
        actualFiles[entry.path] = d.toString('utf8');
      }));
    }
  }

  function verify() {
    var paths = Object.keys(actualFiles).sort();
    var actualContent = actualFiles['package/' + injectedPath];
    t.same(paths, expectedFiles, 'includes injected file path');
    t.same(actualContent, injectedContent, 'includes injected file path');
    t.end();
  }
});
