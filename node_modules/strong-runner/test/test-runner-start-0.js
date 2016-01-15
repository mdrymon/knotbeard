'use strict';

var Runner = require('../').Runner;
var assert = require('assert');
var commit = require('./commit');
var debug = require('debug')('strong-runner:test');
var helpers = require('./helpers');
var tap = require('./tap');

tap.test('start 0 workers', function(t) {
  var app = commit.app();
  var app1 = commit.app1();

  assert.notEqual(app.dir, app1.dir);

  var r = Runner(app, {
    start: 'sl-run --cluster=0 --no-profile',
    console: helpers.tapFriendlyConsole,
  });

  r.start();

  t.plan(1);

  r.on('request', function(req, callback) {
    debug('on request: %j', req);

    if (req.cmd === 'status') {
      t.equal(req.workers.length, 0);
      r.stop();
    }
    return callback();
  });
});
