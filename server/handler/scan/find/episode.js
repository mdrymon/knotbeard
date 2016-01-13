var find = require('find');
var printf = require('printf');
var escapeRegexp = require('escape-regexp');

module.exports = function (options) {
  var directory = options.directory;
  var format = options.format; 
  return {
    find: function (exp, cb) {
      exp = exp || {};
      var regexp;
      //var name = exp.name || "[www.Cpasbien.me] Vikings.S01E01.FRENCH.LD.HDTV.XViD-EPZ.avi";
      var name = exp.name || "";
      //var query = exp.query || {serie: "vikings", version: {season: 1, episode: 1}, extension:['avi']};
      var query = exp.query || {serie: "", version: {season: 0, episode: 0}, extension:[]};
      var version = regstr = '';

      if (!name && !query.serie) {
        cb(new Error("Name and serie can't be empty."));
      }

      version = printf(format, query.version.season, query.version.episode);
      regstr = "((" + escapeRegexp(name) + ")|(" + query.serie + ".*" + version + ".*(" + query.extension.join("|") + ")))";
      regexp = new RegExp(regstr, "igm");

      find.file(regexp, directory, function(files) {
        cb(null, files);
      })
    }
  }
}
