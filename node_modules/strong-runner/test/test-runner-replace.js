'use strict';

var Runner = require('../').Runner;
var assert = require('assert');
var commit = require('./commit');
var debug = require('debug')('strong-runner:test');
var helpers = require('./helpers');
var tap = require('./tap');

// XXX could do version variations on:
// - with started, and with status
// - with different sizes
// - with different workers (first, last) reporting listening and triggering
//   replace
// For now, this is good enough.
tap.test('start and replace', function(t) {
  var app = commit.app();
  var app1 = commit.app1();

  assert.notEqual(app.dir, app1.dir);

  var r = Runner(app, {
    start: 'sl-run --cluster=1 --no-profile',
    console: helpers.tapFriendlyConsole,
  });

  r.start();

  var replaced;

  t.test('original worker', function(tt) {
    tt.plan(2);

    r.on('request', function(req, callback) {
      if (replaced) return;

      debug('original on request: %j', req);

      if (req.cmd === 'listening') {
        tt.equal(req.wid, 1, 'worker 1 listening');
      }
      if (req.cmd === 'status:wd') {
        tt.equal(req.cwd, app.dir);
      }
      return callback();
    });
  });


  t.test('replaced worker', function(tt) {
    replaced = true;
    r.replace(app1);

    tt.plan(2);

    r.on('request', function(req, callback) {
      debug('replaced on request: %j', req);

      if (req.cmd === 'listening') {
        tt.equal(req.wid, 2, 'worker 2 listening');
      }
      if (req.cmd === 'status:wd') {
        tt.equal(req.cwd, app1.dir);
      }
      return callback();
    });
  });

  t.test('stop', function(tt) {
    r.stop();
    tt.end();
  });

  t.end();
});
