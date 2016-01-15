'use strict';

var assert = require('assert');
var commit = require('./commit');
var debug = require('debug')('strong-runner:test');
var fmt = require('util').format;
var helpers = require('./helpers');
var tap = require('tap');
var Runner = require('../').Runner;

exports.test = test;
exports.start = start;
exports.stop = stop;
exports.replace = replace;
exports.kill = kill;

function test(/* steps... */) {
  var steps = Array.prototype.slice.call(arguments);
  var description = steps.map(function(step) {
    return step.name;
  }).join(', ');

  tap.test('test sequence: ' + description, function(t) {
    steps.forEach(function(step) {
      step(t);
    });

    t.end();
  });
}

var startCmd = [
  'sl-run',
  '--cluster=1',
  '--no-profile',
  '--no-timestamp-workers',
  '--no-timestamp-supervisor',
].join(' ');

function start(t) {
  t.test('start', function(tt) {
    delimit(tt, 'start');
    var r = t.runner = Runner(commit.app(), {
      start: startCmd,
      console: helpers.tapFriendlyConsole,
    });

    r.start();
    r.on('request', wait);

    function wait(req) {
      if (req.cmd !== 'status:wd')
        return;
      r.removeListener('request', wait);
      tt.end();
    }

    r.on('request', function(req) {
      if (req.cmd !== 'status') return;
      debug('new status: %j', req);
      t.status = req;
    });

    r.on('exit', function(reason) {
      debug('new status: exit with %j', reason);
      t.status = {master: {reason: reason, pid: t.status.pid}, workers: []};
    });
  });
}

function stop(t) {
  t.test('stop', function(tt) {
    delimit(tt, 'stop');

    var r = t.runner;

    r.stop(function(status) {
      tt.equal(status, 'SIGTERM');
      tt.end();
    });
  });
}

function replace(t) {
  t.test('replace', function(tt) {
    delimit(tt, 'replace');

    var r = t.runner;
    var c = commit.app1();

    var master0 = r.child ? r.child.pid : undefined;
    var dir1 = c.dir;

    var workers0 = t.status.workers;

    debug('replace: old status: %j', t.status);

    r.replace(c);

    r.on('request', wait);

    function wait(req) {
      if (req.cmd === 'status') {
        // Replace is complete when the old worker is gone.
        var master1 = r.child.pid;
        var workers1 = t.status.workers;

        if (workers0[0] && workers0[0].pid === workers1[0].pid) {
          debug('worker[0] not replaced');
          return;
        }

        if (master0) {
          tt.equal(master0, master1, 'supervisor has same pid');
          assert.equal(workers0.length, workers1.length, 'all restarted');
        } else {
          tt.assert(master1 > 0, 'supervisor restarted');
          tt.equal(workers0.length, 0, 'stopped master has no workers');
        }

        workers0.forEach(function(w0, i) {
          var w1 = workers1[i];
          assert.notEqual(w0.id, w1.id, fmt('idx %d w0 %j w1 %j', i, w0, w1));
          assert.notEqual(w0.pid, w1.pid, fmt('idx %d w0 %j w1 %j', i, w0, w1));
        });

        r.removeListener('request', wait);
        tt.end();
      }

      if (req.cmd !== 'status:wd')
        return;

      debug('replace: new wd: %j', req);
      debug('replace: new status: %j', t.status);

      var cwd1 = req.cwd;
      var pwd1 = req.pwd;
      tt.equal(cwd1, dir1, 'worker is in app1 directory');
      tt.equal(pwd1, r.PWD, 'worker has virtual PWD');
    }
  });
}

function kill(t) {
  t.test('kill', function(tt) {
    delimit(tt, 'kill');

    var r = t.runner;
    var master0 = t.status.master;
    var size0 = t.status.workers.length;

    tt.plan(2);

    r.child.kill('SIGKILL');

    r.on('exit', function(reason) {
      tt.equal(reason, 'SIGKILL');
    });

    r.on('request', wait);

    function wait(req) {
      if (req.cmd !== 'status') return;
      // Wait until master AND workers have restarted
      if (req.workers.length !== size0) return;
      r.removeListener('request', wait);

      var master1 = t.status.master;

      tt.notEqual(master0.pid, master1.pid);
    }
  });
}

function delimit(tt, name) {
  debug('sub-test: %s (begin)', name);
  tt.on('end', function() {
    debug('sub-test: %s (on end)', name);
  });
}
