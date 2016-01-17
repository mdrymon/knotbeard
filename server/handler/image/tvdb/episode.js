//@TODO:handler of remote database tv shows

var tvdb = require('./kb-tvdb');

module.exports = function (options) {
  return {
    instanceAlter: function (instance) {
      if (instance) {
        for (var prop in PROPERTIES_MAPPING) {
          if (instance[prop]) {
            instance[PROPERTIES_MAPPING[prop]] = instance[prop];
            instance.unsetAttribute(prop);
          }
        }
      }
    }
  }
};
