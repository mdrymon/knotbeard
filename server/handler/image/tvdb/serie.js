var tvdb = require('./kb-tvdb');
var path = require('path');
var request = require('request');
var fs = require('fs');

module.exports = function (options) {
  var urls = options.urls;
  return {
    load: function(instance, cb) {
      /*tvdb.getBanners(id, function(err, response) {
        //@TODO
      });*/
      var index;
      var id = instance.TvDbId;
      var dir = path.join(options.directory, instance.Name);
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      for (index in urls) {
        request(urls[index].link + id + urls[index].suffix)
          .on('error', function(err) { console.log('IMG err', err) })
          .pipe(fs.createWriteStream(path.join(dir, index + '.jpg')));
      }
      if (cb) {
        cb(null, {success: TRUE});
      }
    }
  }
}
