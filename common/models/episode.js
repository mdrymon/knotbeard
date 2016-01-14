var printf = require('printf');

var TOKEN_DB = 'database';
var TOKEN_P2P = 'torrent';
var TOKEN_PARSE = 'parser';
var TOKEN_DL = 'download';
var TOKEN_SC = 'scan';
var TOKEN_MV = 'move';
var MODEL = 'episode';
//@TODO:get path root
var api = require(process.env.PWD + '/server/handler/loader');

module.exports = function(Episode) {
  
  // Bind methods
  Episode.search = api(TOKEN_P2P, MODEL).search;
  Episode.torrent = api(TOKEN_PARSE, MODEL).torrent;
  Episode.process = api(TOKEN_DL, MODEL).process;
  Episode.finder = api(TOKEN_SC, MODEL).find;
  Episode.move = api(TOKEN_MV, MODEL).move;

  // Methods
  Episode.searchById = function (id, cb) {
    var mode = 'sync';
    var Serie = this.app.models.Serie;
    this.findById(id, function (err, episode) {
      if (episode.Status !== "WANTED") {
        return cb(new Error("Unvalid episode status"));
      }
      var serieId = episode.SerieId;
      Serie.findById(serieId, function (err, serie) {
        if (serie) {
          return Episode.search(serie.Name + ' ' + printf("s%02de%02d", episode.Season, episode.Index), mode, cb);
        }
        return cb(new Error("Internal error"));
      });
    });
  }

  // Remote methods     
  Episode.remoteMethod(
    'search', 
    {
       accepts: [
         {arg: 'query', type: 'string'},
         {arg: 'mode', type: 'string', default:'sync'},
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/api/' + TOKEN_P2P + '/search', verb: 'get'}
    }
  );
  Episode.remoteMethod(
    'searchById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/:id/' + TOKEN_P2P + '/search', verb: 'put'}
    }
  );
  Episode.remoteMethod(
    'torrent', 
    {
       accepts: [
         {arg: 'link', type: 'string'},
         {arg: 'mode', type: 'string', default:'sync'}
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/api/' + TOKEN_PARSE + '/torrent', verb: 'get'}
    }
  ); 
  Episode.remoteMethod(
    'process', 
    {
       accepts: [
         {arg: 'link', type: 'string'},
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/api/' + TOKEN_DL + '/process', verb: 'post'}
    }
  ); 
  Episode.remoteMethod(
    'finder', 
    {
       accepts: [
         {arg: 'exp', type: 'object'},
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/api/' + TOKEN_SC + '/find', verb: 'get'}
    }
  ); 
  Episode.remoteMethod(
    'move', 
    {
       accepts: [
         {arg: 'file', type: 'string'},
         {arg: 'req', type: 'object'}
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/api/' + TOKEN_MV + '/file', verb: 'post'}
    }
  ); 

  // Operation hooks
  Episode.observe('before save', function filterProperties(ctx, next) {
    api(TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

};
