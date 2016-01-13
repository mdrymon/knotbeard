//@TODO:handler of remote database tv shows

var readTorrent = require("read-torrent");
var Q = require('q');

module.exports = function (options) {
  return {
    torrent: function (link, mode, cb) {
      var deferred = Q.defer();
      
      readTorrent(link, function(err, torrent) {
        var data = {name:torrent.name, infoHash: torrent.infoHash};
        data.name = torrent.name || '';
        data.infoHash = torrent.infoHash || '';
        data.files = torrent.files || [];
        if (mode === 'async') {
          deferred.resolve(data);
          return deferred.promise;
        }
        else {
          cb(null, data);
        }
      });
    }
  }
}
