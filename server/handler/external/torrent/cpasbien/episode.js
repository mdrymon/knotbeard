var cheerio = require('cheerio');
var Q = require('q');
var request = require("request");
var url = require('url');
var util = require('util');

var BASE_URL = 'http://www.cpasbien.io';
var TORRENT_URI = '/telechargement/%s.torrent';

module.exports = {
  search: function(query, mode, cb) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('-');
    var search_url = BASE_URL + "/recherche/" + search_query + ".html";
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var limit = 200;
    var error = null;

    request(search_url, function(err, response, body){
     
      // Request failure
      if (err || response.statusCode !== 200) {
        (mode === 'async') ?
          deferred.reject('Failure, there was a problem loading Cpasbien'):
          error = new Error('Failure, there was a problem loading Cpasbien');
      }

      // Data treatment
      if(!err && response.statusCode === 200) {
        var cpasbien_link, torrent_title, torrent_size, torrent_seeds, torrent_leech, date_added;
        $ = cheerio.load(body);

        for(var count = 0; count < $("div .ligne0, div .ligne1").length && count < limit; count++) {
          cpasbien_link = $($("div .ligne0, div .ligne1")[count]).children("a").attr('href');
          cpasbien_link = url.parse(cpasbien_link);
          cpasbien_link = cpasbien_link.pathname.split('/').pop();
          cpasbien_link = cpasbien_link.split('.').shift();
          cpasbien_link =  BASE_URL + util.format(TORRENT_URI, cpasbien_link);
          torrent_title = $($("div .ligne0, div .ligne1")[count]).children("a").text();

          data_content = {
            index: count,
            title: torrent_title,
            torrent_site: cpasbien_link,
            date_added: date_added
          };

          torrent_content.push(data_content);
        }
      }
 
      // Responses
      if (mode == 'async') {
       (!torrent_content) ?
          deferred.reject('Failure, no torrents found'):
          deferred.resolve(torrent_content);
      }
      else {
        (!torrent_content) ?
        error = new Error('Failure, no torrents found'):
        cb(null, torrent_content);
      }
    });

    // Async return promise
    if (mode === 'async') {
      return deferred.promise;
    }

  }
}
