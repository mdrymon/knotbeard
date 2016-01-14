var cheerio = require('cheerio');
var Q = require('q');
var request = require("request");
var url = require('url');
var util = require('util');

var BASE_URL = 'http://www.cpasbien.io';
var TORRENT_URI = '/telechargement/%s.torrent';

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

      var url_request = BASE_URL + "/recherche/" + query + ".html";
      var data = {};
      var deferred = Q.defer();
      var content, contentLanguage, contentQuality;
      var limit = 200;
      var title = '';

      query = query.split(' ').join('-');
      request(url_request, function(err, response, body){
       
        // Request failure
        if (err || response.statusCode !== 200) {
          (mode === 'async') ? 
            deferred.reject('Failure, there was a problem loading Cpasbien'):
            cb(new Error('Failure, there was a problem loading Cpasbien'));
          return;
        }

        // Data treatment
        $ = cheerio.load(body);
        content = [];
        for(var count = 0; count < $("div .ligne0, div .ligne1").length && count < limit; count++) {
          data.index = count + 1;
          title = $($("div .ligne0, div .ligne1")[count]).children("a").text();
          data.link = $($("div .ligne0, div .ligne1")[count]).children("a").attr('href');
          data.link = url.parse(data.link).pathname.split('/').pop().split('.').shift();
          data.link = BASE_URL + util.format(TORRENT_URI, data.link);
          data.title = title;
          data.query = query;
          data.filters = {};
          data.status = -1; // status -1 not processed, 0 processed, 1 failed
          content.push(JSON.parse(JSON.stringify(data)));
          data = {};
        }
        contentLanguage = [];
        for(count = 0; count < content.length; count++) {
          if (regLanguage.test(content[count].title)) {
            contentLanguage.push(content[count]);
            content[count].filters.language = options.language;
          }
        }
        (contentLanguage.length) && (content = contentLanguage);
        contentQuality = [];
        for(count = 0; count < content.length; count++) {
          if (regQuality.test(content[count].title)) {
            contentQuality.push(content[count]);
            content[count].filters.quality = options.quality;
          }
        }
        (contentQuality.length) && (content = contentQuality);

        // Responses
        if (mode == 'async') {
         (!content) ?
            deferred.reject('Failure, no torrents found'):
            deferred.resolve(content);
        }
        else {
          (!content) ?
          cb(new Error('Failure, no torrents found')):
          cb(null, content);
        }
      });

      // Async return promise
      if (mode === 'async') {
        return deferred.promise;
      }

    }
  }
}
