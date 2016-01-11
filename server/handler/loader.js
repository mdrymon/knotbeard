/**
 * @TODO: Split handler into sub modules
 */

var path = require('path');
//@TODO:Do a real loader
module.exports = function (_interface, handler, modelName) {
  //@TODO:check dir exists
  //@TODO: Use configstore module
  var config = require('./' + _interface + '/config');
  return require('./' + path.join(_interface, handler,  config[handler], modelName));
}
