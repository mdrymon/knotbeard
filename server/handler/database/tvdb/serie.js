//@TODO:handler of remote database tv shows

var TVDB = require("node-tvdb");
//@TODO:Put in config
var PROPERTIES_MAPPING = {
  id: "TvDbId",
  zap2it_id: "Zap2ItId",
  SeriesName: "Name",
  IMDB_ID: "ImdbId",
  language: "Lang"
};
var tvdb = new TVDB("8163E782045ED7FB", 'en');

module.exports = function (config) {
  return {
    load: function(id, cb) {
      var self = this;
      tvdb.getSeriesAllById(id, function(err, response) {
        // handle error and response
        var Episode = self.app.models.Episode;
        var episodes = response.Episodes;
        delete response.Episodes;
        self.create(response, function (err, serie) {
          for(var index = 0; index < episodes.length; index++) {
            episodes[index]["SerieId"] = serie.id;
          }
          Episode.create(episodes, function (err, episodes) {
            cb(null, response);
          })
        })
      });
    },
    search: function(query, cb) {
      tvdb.getSeriesByName(query, function(err, response) {
        // handle error and response
        cb(null, response);
      });
    },
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
