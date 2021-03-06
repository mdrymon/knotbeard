var request = require('request');
var TOKEN_DB = 'database';
var TOKEN_IMG = 'image';
var MODEL = 'serie';
//@TODO:get path root, use path:join
var api = require(process.env.PWD + '/server/handler/loader');
module.exports = function(Serie) {

  // Bind methods
  var apiDb = api(TOKEN_DB, MODEL);
  Serie.search = apiDb.search; 
  Serie.load = apiDb.load; 

  // Remote methods     
  Serie.remoteMethod(
    'load', 
    {
       // Remote database Id
       accepts: [{arg: 'id', type: 'number'}],
       returns: {root: true, type: 'object'},
       http: {path: '/' + TOKEN_DB + '/load', verb: 'post'}
    }
  );
  Serie.remoteMethod(
    'search',
    {
      accepts: [{arg: 'q', type: 'string'}],
      returns: {root: true, type: 'object'},
      http: {path: '/' + TOKEN_DB + '/search', verb: 'get'}
    }
  );

  // Operation hooks
  Serie.observe('before save', function (ctx, next) {
    api(TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

  Serie.observe('after save', function (ctx, next) {
    if (ctx.instance) {
      api(TOKEN_IMG, MODEL).load(ctx.instance);
    }
    next();
  });

};
