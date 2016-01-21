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
      console.log('serie', episode);
      Serie.findById(episode.SerieId, function (err, serie) {
        if (serie) {
          return Episode.search(serie.Name + ' ' + printf("s%02de%02d", episode.Season, episode.Index), mode, function (err, data) {
            if (err) {
              return cb(err);
            }
            episode.Torrent = data;
            episode.updateAttributes({Status: "GOT", Torrent: episode.Torrent}, function (err, instance) {
              cb(null, instance.Torrent);
            })
          });
        }
        else {
          return cb(new Error("Internal error"));
        }
      });
    });
  }
  Episode.torrentById = function (id, cb) {
    var mode = 'sync';
    this.findById(id, function (err, episode) {
      if (episode.Status !== "GOT") {
        return cb(new Error("Unvalid episode status"));
      }
      var torrent;
      for (var i = 0; i < episode.Torrent.length; i++) {
        if (episode.Torrent[i].status < 1) {
          torrent = episode.Torrent[i];
          break;
        }
      }
      return Episode.torrent(torrent.link, mode, function (err, data) {
        if (err) {
          return cb(err);
        }
        if (data.name) {
          episode.Torrent[i].file = data.name;
          episode.Torrent[i].hash = data.infoHash;
          return episode.updateAttributes({Status: "PARSED", Torrent: episode.Torrent}, function (err, instance) {
            cb(null, instance);
          })
        }
        return cb(new Error('Internal error.'));
      });
    });
  }
  Episode.processById = function (id, cb) {
    var mode = 'sync';
    this.findById(id, function (err, episode) {
      if (episode.Status !== "GOT" && episode.Status !== "PARSED") {
        return cb(new Error("Unvalid episode status"));
      }
      var torrent;
      for (var i = 0; i < episode.Torrent.length; i++) {
        if (episode.Torrent[i].status < 1) {
          torrent = episode.Torrent[i];
          episode.Torrent[i].status = 0; // 0 this torrent file has been processed
          break;
        }
      }
      return Episode.process(torrent.link, function (err, data) {
        if (err) {
          return cb(err);
        }
        if (data.success) {
          return episode.updateAttributes({Status: "PROCESSED", Torrent: episode.Torrent}, function (err, instance) {
            cb(null, instance);
          })
        }
        return cb(new Error('Internal error.'));
      });
    });
  }
  Episode.finderById = function (id, cb) {
    var mode = 'sync';
    var Serie = this.app.models.Serie;
    this.findById(id, function (err, episode) {
      if (episode.Status !== "PROCESSED") {
        return cb(new Error("Unvalid episode status"));
      }
      var torrent;
      for (var i = 0; i < episode.Torrent.length; i++) {
        if (episode.Torrent[i].status < 1) {
          torrent = episode.Torrent[i];
          episode.Torrent[i].status = 0; // 0 this torrent file has been processed
          break;
        }
      }
      //{"name":"The.Walking.Dead.S02E06.FRENCH.LD.HDTV.XviD-JMT", "serie":"The Walking Dead", "version": {"season":2,"episode":6}, "extension":["avi"]}
      Serie.findById(episode.SerieId, function (err, serie) {
        var exp = {
          name: torrent.file,
          serie: serie.Name,
          version: {season: episode.Season, episode:episode.Index},
          extension: ['avi']
        };
        return Episode.finder(exp, function (err, data) {
          if (err) {
            return cb(err);
          }
          if (data.length) {
            episode.Torrent[i].path = data.pop();
            return episode.updateAttributes({Status: "DOWNLOADED", Torrent: episode.Torrent}, function (err, instance) {
              cb(null, instance);
            })
          }
          return cb(new Error('Internal error.'));
        })
      })
    });
  }
  Episode.moveById = function (id, cb) {
    var mode = 'sync';
    var Serie = this.app.models.Serie;
    this.findById(id, function (err, episode) {
      if (episode.Status !== "DOWNLOADED") {
        return cb(new Error("Unvalid episode status"));
      }
      var torrent;
      for (var i = 0; i < episode.Torrent.length; i++) {
        if (episode.Torrent[i].status < 1) {
          torrent = episode.Torrent[i];
          episode.Torrent[i].status = 0; // 0 this torrent file has been processed
          break;
        }
      }
      Serie.findById(episode.SerieId, function (err, serie) {
        var req = {
          serie: serie.Name,
          season: episode.Season,
          episode: episode.Index,
          name: episode.Name
        };
        return Episode.move(torrent.path, req, function (err, data) {
          if (err) {
            return cb(err);
          }
          if (data.success) {
            return episode.updateAttributes({Status: "MOVED"}, function (err, instance) {
              cb(null, instance);
            })
          }
          return cb(new Error('Internal error.'));
        })
      })
    });
  }

  // Remote methods

  // Api wrapper By Id
  Episode.remoteMethod(
    'searchById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/:id/' + TOKEN_P2P + '/search', verb: 'put'}
    }
  );
  Episode.remoteMethod(
    'torrentById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/:id/' + TOKEN_PARSE + '/torrent', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'processById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/:id/' + TOKEN_DL + '/process', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'finderById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/:id/' + TOKEN_SC + '/find', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'moveById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/:id/' + TOKEN_MV + '/file', verb: 'put'}
    }
  ); 

  // Api
  Episode.remoteMethod(
    'search', 
    {
       accepts: [
         {arg: 'query', type: 'string'},
         {arg: 'mode', type: 'string', default:'sync'},
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + TOKEN_P2P + '/search', verb: 'get'}
    }
  );
  Episode.remoteMethod(
    'torrent', 
    {
       accepts: [
         {arg: 'link', type: 'string'},
         {arg: 'mode', type: 'string', default:'sync'}
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + TOKEN_PARSE + '/torrent', verb: 'get'}
    }
  ); 
  Episode.remoteMethod(
    'process', 
    {
       accepts: [
         {arg: 'link', type: 'string'},
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + TOKEN_DL + '/process', verb: 'post'}
    }
  ); 
  Episode.remoteMethod(
    'finder', 
    {
       accepts: [
         {arg: 'exp', type: 'object'},
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + TOKEN_SC + '/find', verb: 'get'}
    }
  ); 
  Episode.remoteMethod(
    'move', 
    {
       accepts: [
         {arg: 'file', type: 'string'},
         {arg: 'req', type: 'object'}
       ],
       //returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + TOKEN_MV + '/file', verb: 'post'}
    }
  ); 

  // Operation hooks
  Episode.observe('before save', function filterProperties(ctx, next) {
    api(TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

};
