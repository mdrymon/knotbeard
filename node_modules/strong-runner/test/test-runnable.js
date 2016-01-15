'use strict';

var Runnable = require('../').Runnable;
var app = require('path').resolve(__dirname, 'app');
var tap = require('tap');

tap.test('runnable creation', function(t) {
  var env = {KEY: 'VALUE'};
  var r = Runnable({dir: app, env: env, hash: 'HASH'});

  t.equal(r.dir, app);
  t.equal(r.env.KEY, env.KEY);
  delete env.KEY;
  t.equal(r.env.KEY, 'VALUE', 'commit uses env value, not reference');
  t.assert(r.spawn);
  t.equal(r.id, undefined, 'no id');
  t.equal(r.hash, 'HASH', 'has hash');
  t.end();
});

tap.test('runnable requires dir', function(t) {
  t.throws(function() {
    Runnable();
  }, 'no options');
  t.throws(function() {
    Runnable({});
  }, 'no dir');
  t.end();
});

tap.test('runnable does not require env', function(t) {
  var r = Runnable({dir: app});
  t.deepEqual(r.env, {}, 'empty env');
  t.end();
});
