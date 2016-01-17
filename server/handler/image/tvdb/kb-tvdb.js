//@TODO:handler of remote database tv shows

var TVDB = require("node-tvdb");
var PROPERTIES_MAPPING = {
  id: "TvDbId",
  zap2it_id: "Zap2ItId",
  SeriesName: "Name",
  IMDB_ID: "ImdbId",
  language: "Lang"
};

module.exports = new TVDB("8163E782045ED7FB", 'en');