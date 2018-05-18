//@TODO:handler of remote database tv shows

var TVDB = require("node-tvdb");
//@TODO:Put in config 
var PROPERTIES_MAPPING = {
  id: "TvDbId",
  episodeName: "Name",
  airedSeason: "Season",
  airedEpisodeNumber: "Index",
  imdbId: "ImdbId",
  language: "Lang"
};
var tvdb = new TVDB("8163E782045ED7FB", 'en');

module.exports = function (options){
  return {
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
}
