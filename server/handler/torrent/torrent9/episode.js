var cheerio = require('cheerio');
var request = require("request");
var printf = require('printf');

var BASE_URL = 'http://www.torrent9.red';
var TORRENT_SEARCH_URI = BASE_URL + '/search_torrent/%s.html';

module.exports = function (options) {
  //@TODO: the words can be at the end of line
  var prefixAndSuffix = function (element) {
    return options.regex.prefix + element + options.regex.suffix;
  };
  var quality = options.quality.map(prefixAndSuffix);
  var language = options.language.map(prefixAndSuffix);
  var regLanguage = new RegExp(language.join('|'), 'igm');
  var regQuality = new RegExp(quality.join('|'), 'igm');
  return {
    search: function(query, mode, cb) {

      // @TODO: i18n
      query += ' french';
      query = query.split(' ').join('-');

      var url_request = printf(TORRENT_SEARCH_URI, query);
      var data = {};
      var content, contentLanguage, contentQuality;
      var limit = 200;
      var title = '';

      request(url_request, function(err, response, body) {
       
        // Request failure
        if (err || response.statusCode !== 200) {
          return cb(new Error('Failure, there was a problem loading Torrent9 (search)'));
        }

        // Data treatment
        $ = cheerio.load(body);
        content = [];
        data.title = $($("table tbody tr td")[0]).children("a").text();
        data.search_link = BASE_URL + $($("table tbody tr td")[0]).children("a").attr('href');
        data.query = query;
        data.filters = {};
        data.status = -1; // status -1 not processed, 0 processed, 1 failed
        
        request(data.search_link, function(err, response, body) {
          if (err || response.statusCode !== 200) {
            return cb(new Error('Failure, there was a problem loading Torrent9 (parse)'));
          }

          $ = cheerio.load(body);
          data.link = BASE_URL + $(".btn, .btn-danger, .download").attr('href');
          cb(null, [data]);
        });
      });
    }
  }
}
