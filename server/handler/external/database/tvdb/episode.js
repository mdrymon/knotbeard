//@TODO:handler of remote database tv shows

var TVDB = require("node-tvdb");
var PROPERTIES_MAPPING = {
  id: "TvDbId",
  EpisodeName: "Name",
  SeasonNumber: "Season",
  EpisodeNumber: "Index",
  IMDB_ID: "ImdbId",
  language: "Lang"
};
var tvdb = new TVDB("8163E782045ED7FB", 'en');

module.exports = {
  instanceAlter: function (instance) {
    if (instance) {
      for (var prop in PROPERTIES_MAPPING) {
        if (instance[prop]) {
          instance[PROPERTIES_MAPPING[prop]] = instance[prop];
          instance.unsetAttribute(prop);
        }
      };
    }
  }
}
