var TOKEN_DB = 'database';
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
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/api/' + TOKEN_DB + '/load', verb: 'post'}
    }
  ); 
  Serie.remoteMethod(
    'search', 
    {
       accepts: [{arg: 'q', type: 'string'}],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/api/' + TOKEN_DB + '/search', verb: 'get'}
    }
  ); 

  // Operation hooks
  Serie.observe('before save', function filterProperties(ctx, next) {
    api(TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

};
