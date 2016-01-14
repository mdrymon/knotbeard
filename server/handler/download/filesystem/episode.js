var request = require('request');
var fs = require('fs');
var url = require('url');
var path = require('path');

module.exports = function (options) {
  if (!options.directory) {
    throw new Error("Download directory required.");
  }
  return {
    process : function (link, cb) {
      var filename = url.parse(link).pathname.split('/').pop();
      if (filename) {
        var data = request(link).pipe(fs.createWriteStream(path.join(options.directory, filename)));
        return cb(null, {success: true});
      }
      return cb(new Error('Torrent file failure.'));
    }
  }
}
