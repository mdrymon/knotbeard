var INTERFACE = 'external';
var TOKEN_DB = 'database';
var MODEL = 'serie';
//@TODO:get path root, use path:join
var handler = require(process.env.PWD + '/server/handler/loader');
module.exports = function(Serie) {

  // Bind methods
  Serie.search = handler(INTERFACE, TOKEN_DB, MODEL).search; 
  Serie.load = handler(INTERFACE, TOKEN_DB, MODEL).load; 

  // Remote methods     
  Serie.remoteMethod(
    'load', 
    {
       // Remote database Id
       accepts: [{arg: 'id', type: 'number'}],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + INTERFACE + '/' + TOKEN_DB + '/load', verb: 'post'}
    }
  ); 
  Serie.remoteMethod(
    'search', 
    {
       accepts: [{arg: 'q', type: 'string'}],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + INTERFACE + '/' + TOKEN_DB + '/search', verb: 'get'}
    }
  ); 

  // Operation hooks
  Serie.observe('before save', function filterProperties(ctx, next) {
    handler(INTERFACE, TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

};
