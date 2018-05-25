'use strict';
var configs = require('../../server/handler/config');

module.exports = function(Setting) {

  Setting.init = function (cb) {
    var self = this;
    var settings = [];
    for (var config in configs) {
      settings.push({Provider: config, Config: configs[config]});
    }
    self.create(settings, function (err, settings) {
      if (err)
        return cb(err);
      return cb(err, settings);
    }); 
  }

  Setting.remoteMethod(
    'init', 
    {
       returns: {root:true, type: 'object'},
       http: {path: '/init', verb: 'post'}
    }
  ); 

};
