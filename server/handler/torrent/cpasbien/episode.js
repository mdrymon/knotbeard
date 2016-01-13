var cheerio = require('cheerio');
var Q = require('q');
var request = require("request");
var url = require('url');
var util = require('util');

var BASE_URL = 'http://www.cpasbien.io';
var TORRENT_URI = '/telechargement/%s.torrent';

module.exports = function (options) {
  return {
    search: function(query, mode, cb) {

      var url_request = BASE_URL + "/recherche/" + query + ".html";
      var deferred = Q.defer();
      var data = {};
      var content = [];
      var limit = 200;

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
        for(var count = 0; count < $("div .ligne0, div .ligne1").length && count < limit; count++) {
          data.link = $($("div .ligne0, div .ligne1")[count]).children("a").attr('href');
          data.link = url.parse(data.link).pathname.split('/').pop().split('.').shift();
          data.link = BASE_URL + util.format(TORRENT_URI, data.link);
          data.title = $($("div .ligne0, div .ligne1")[count]).children("a").text();
          data.index = count + 1;
          content.push(JSON.parse(JSON.stringify(data)));
          data = {};
        }
   
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
