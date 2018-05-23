var fs = require('fs');
var printf = require('printf');
var escapeRegexp = require('escape-regexp');

module.exports = function (options) {
  var directory = options.directory;
  var format = options.format;
  var extension = options.extension;
  // @TODO use path join
  return {
    find: function (exp, cb) {
      exp = exp || {};
      var regexp;
      var path = "";
      exp.videos = [];
      for (var i = 0; i < exp.files.length; i++) {
        exp.files[i].found = false;
        path = directory + '/' + exp.files[i].path;
        if (fs.existsSync(directory + '/' + exp.files[i].path)) {
          exp.files[i].found = true;
          if (extension.includes(exp.files[i].name.split('.').pop())) {
            exp.videos.push(path);
          }
        }
      }
      cb(null, exp);
    }
  }
}
