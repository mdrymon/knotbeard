var printf = require('printf');

var TOKEN_DB = 'database';
var TOKEN_P2P = 'torrent';
var TOKEN_PARSE = 'parser';
var TOKEN_DL = 'download';
var TOKEN_SC = 'scan';
var TOKEN_MV = 'move';
var TOKEN_RUN = 'build';
var MODEL = 'episode';
//@TODO:get path root
var api = require(process.env.PWD + '/server/handler/loader');
var config = require('../../server/handler/config');

var MAPPING_STATUS = {
  WANTED: 'searchById',
  GOT:'torrentById',
  PARSED:'processById',
  PROCESSED:'finderById',
  DOWNLOADED:'moveById'
}

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
      if (err) {
        return cb(err);
      }
      if (episode.Status !== "WANTED") {
        return cb(new Error("Unvalid episode status"));
      }
      Serie.findById(episode.SerieId, function (err, serie) {
        if (serie) {
          var filter = new RegExp(
            config.torrent.options.filter.pattern,
            config.torrent.options.filter.flag
          );
          return Episode.search(serie.Name.replace(filter, '') + ' ' + printf("s%02de%02d", episode.Season, episode.Index), mode, function (err, data) {
            if (err) {
              return cb(err);
            }
            if (!data.length) {
              return cb(null, data);
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
          episode.Torrent[i].name = data.name;
          episode.Torrent[i].files = data.files;
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
      if (episode.Status !== "PARSED") {
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
      if (episode.Torrent[0].status < 1) {
        torrent = episode.Torrent[0];
        episode.Torrent[0].status = 0; // 0 this torrent file has been processed
      }
      Serie.findById(episode.SerieId, function (err, serie) {
        var exp = {
          name: torrent.name,
          files: torrent.files,
          serie: serie.Name,
          version: {season: episode.Season, episode:episode.Index},
          videos: [],
        };
        return Episode.finder(exp, function (err, data) {
          if (err) {
            return cb(err);
          }
          if (data.files.length) {
            var obj = !data.videos.length ?
              {Torrent: episode.Torrent} :
              {Status: "DOWNLOADED", Torrent: episode.Torrent, Videos: data.videos};
            episode.Torrent[0].files = data.files;
            episode.videos = data.videos;
            return episode.updateAttributes(obj, function (err, instance) {
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
      var videos = episode.Videos;
      Serie.findById(episode.SerieId, function (err, serie) {
        var req = {
          serie: serie.Name,
          season: episode.Season,
          episode: episode.Index,
          name: episode.Name
        };
        for (var i = 0; i < videos.length; i++) {
          Episode.move(videos[i], req, function (err, data) {
            if (err) {
              return cb(err);
            }
          })
        }
        return episode.updateAttributes({Status: "MOVED"}, function (err, instance) {
           cb(null, instance);
        })
      })
    });
  }

  Episode.runTorrent = function (id, cb) {
    var self = this;
    Episode.findById(id, function(err, instance) {
      if (err)
        return cb(err);
      if (instance.Status === "PROCESSED" || instance.Status === "MOVED")
        return cb(null, instance);
      else {
        self[MAPPING_STATUS[instance.Status]](id, function (err, data) {
            if (err)
              return cb(err);
            self.runTorrent(id, cb);
        })
      }
    })
  }

  Episode.runFile = function (id, cb) {
    Episode.finderById(id, function (err, data) {
      Episode.moveById(id, function (err, data) {
        cb(err, data); 
      })  
    }) 
  }

  // Remote methods

  // Api wrapper By Id
  Episode.remoteMethod(
    'searchById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/:id/' + TOKEN_P2P + '/search', verb: 'put'}
    }
  );
  Episode.remoteMethod(
    'torrentById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/:id/' + TOKEN_PARSE + '/torrent', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'processById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/:id/' + TOKEN_DL + '/process', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'finderById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/:id/' + TOKEN_SC + '/find', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'moveById', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/:id/' + TOKEN_MV + '/file', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'runTorrent', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/:id/' + TOKEN_RUN + '/torrent', verb: 'put'}
    }
  ); 
  Episode.remoteMethod(
    'runFile', 
    {
       accepts: [
         {arg: 'id', type: 'number'}
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/:id/' + TOKEN_RUN + '/file', verb: 'put'}
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
       returns: {root:true, type: 'object'},
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
       returns: {root:true, type: 'object'},
       http: {path: '/' + TOKEN_PARSE + '/torrent', verb: 'get'}
    }
  ); 
  Episode.remoteMethod(
    'process', 
    {
       accepts: [
         {arg: 'link', type: 'string'},
       ],
       returns: {root:true, type: 'object'},
       http: {path: '/' + TOKEN_DL + '/process', verb: 'post'}
    }
  ); 
  Episode.remoteMethod(
    'finder', 
    {
       accepts: [
         {arg: 'exp', type: 'object'},
       ],
       returns: {root:true, type: 'object'},
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
       returns: {root:true, type: 'object'},
       http: {path: '/' + TOKEN_MV + '/file', verb: 'post'}
    }
  ); 

  // Operation hooks
  Episode.observe('before save', function filterProperties(ctx, next) {
    api(TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

};
