var tvdb = require('./kb-tvdb');
var path = require('path');
var request = require('request');
var fs = require('fs');

var urls = {
  poster: {
    link: 'http://thetvdb.com/banners/posters/',
    suffix: '-1.jpg'
  },
  /*season: {
    link: 'http://thetvdb.com/banners/seasons/',
    suffix: '-1.jpg'
  },*/
  banner: {
    link: 'http://thetvdb.com/banners/graphical/',
    suffix: '-g2.jpg'
  },
  fanart: {
    link: 'http://thetvdb.com/banners/fanart/original/',
    suffix: '-1.jpg'
  }
};

module.exports = function (options) {
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
        console.log('IMG', path.join(dir, index + '.jpg'));
        request(urls[index].link + id + urls[index].suffix).pipe(fs.createWriteStream(path.join(dir, index + '.jpg')));
      }
      if (cb) {
        cb(null, {success: TRUE});
      }
    }
  }
}
