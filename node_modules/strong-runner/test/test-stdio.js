'use strict';

var Stdio = require('../lib/stdio');
var bl = require('bl');
var tap = require('tap');

tap.test('stdio accumulator', function(t) {
  var dst = bl(function(err, data) {
    t.ifError(err);
    t.equal(String(data), 'a1a2b1b2');
    t.end();
  });
  var srcA = bufs(['a1', 'a2']);
  var srcB = bufs(['b1', 'b2']);
  var stdio = Stdio('stdio');

  stdio.from(srcA);

  setImmediate(function() {
    stdio.pipe(dst);
    stdio.pipe(process.stderr);
    stdio.from(srcB);
    setImmediate(function() {
      stdio.end();
    });
  });
});

function bufs(list) {
  var b = bl();
  list.forEach(function(_) {
    b.append(_);
  });
  return b;
}
