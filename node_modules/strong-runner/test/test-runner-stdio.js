'use strict';

var Runner = require('../').Runner;
var assert = require('assert');
var byline = require('byline');
var commit = require('./commit');
var debug = require('debug')('strong-runner:test');
var helpers = require('./helpers');
var tap = require('./tap');

tap.test('stdio for workers', function(t) {
  var app = commit.app();
  var app1 = commit.app1();

  assert.notEqual(app.dir, app1.dir);

  var r = Runner(app, {
    start: 'sl-run --cluster=2 --no-profile'
      + '  --no-timestamp-workers --no-timestamp-supervisor',
    console: helpers.tapFriendlyConsole,
  });

  r.start();

  var stdout = byline(r.stdout);

  t.test('original workers', function(tt) {
    debug('wait for w1, w2');
    tt.plan(2);
    watchForWorker(tt, 1);
    watchForWorker(tt, 2);
  });

  t.test('resize cluster', function(tt) {
    debug('wait for resize');
    tt.plan(1);
    r.request({
      cmd: 'set-size',
      size: 4,
    }, function(rsp) {
      debug('resized: %j', rsp);
      tt.equal(rsp.error, undefined, rsp.error || 'resized');
    });
  });

  t.test('new workers', function(tt) {
    debug('wait for w3, w4');
    tt.plan(2);
    watchForWorker(tt, 3);
    watchForWorker(tt, 4);
  });

  function watchForWorker(t, n) {
    var saw;
    stdout.on('data', function(line) {
      if (saw) return;
      debug('is %d in <%s>', n, line);
      if (!saw && RegExp('worker:' + n).test(line)) {
        saw = true;
        debug('yes!');
        t.assert(true, 'saw worker ' + n);
      }
    });
  }

  t.test('stop', function(tt) {
    r.stop();
    tt.end();
  });

  t.end();
});
