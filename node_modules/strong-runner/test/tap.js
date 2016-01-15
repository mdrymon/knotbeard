var tap = require('tap');

module.exports = tap;

var _test = tap.test;

tap.test = function test(name) {
  var selected = process.env.TAP_SELECT ?
    RegExp(process.env.TAP_SELECT).test(name) : true;

  if (selected) {
    return _test.apply(tap, arguments);
  }

  // XXX(sam) return, or skip... usually I want as little output as possible,
  // I think I'll return for now.
  return;

  // XXX(sam) explanation is empty, not sure how to fill it in, or if useful,
  // see above
  // return _test.call(tap, name, {skip: true}, function() {});
};
