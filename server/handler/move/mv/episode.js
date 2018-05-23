var mv = require('mv');
var path = require('path');
var printf = require('printf');

module.exports = function (options) {
  var directory = options.directory;
  if (!directory) {
    throw new Error("Please, configure your move directory.");
  }
  return {
    move : function (file, req, cb) {
      if (!req.serie) {
        return cb(new Error("Serie can't be empty."));
      }
      if (!req.season) {
        return cb(new Error("Season can't be empty."));
      }
      if (!req.episode) {
        return cb(new Error("Episode can't be empty."));
      }
      var extension = '.' + file.split('.').pop() || '';
      var name = ' ' + req.name || ''
      mv(file, path.join(directory, req.serie, req.serie + ' - ' + req.season + 'x' + printf('%02d', req.episode) + name + extension), {mkdirp: true}, function (err) {
        if (err) {
          cb(err);
        }
        cb(null, {success: true});
      });
    }
  }
}
