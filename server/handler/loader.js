/**
 * @TODO: Split handler into sub modules
 */

var path = require('path');
//@TODO:Do a real loader
module.exports = function (handler, modelName) {
  //@TODO:check dir exists
  //@TODO: Use configstore module
  var config = require('./config');
  if (!config[handler]) {
    throw new Error("Handler '" + handler + "' unknown.");
  }
  if (!config[handler].provider) {
    throw new Error("Provider can't be empty.");
  }
  if (!config[handler].options) {
    config[handler].options = {};
  }
  console.log('PATH', './' + path.join(handler,  config[handler].provider, modelName));
  return require('./' + path.join(handler,  config[handler].provider, modelName))(config[handler].options);
}
