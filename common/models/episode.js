var INTERFACE = 'external';
var TOKEN_DB = 'database';
var TOKEN_P2P = 'torrent';
var MODEL = 'episode';
//@TODO:get path root
var handler = require(process.env.PWD + '/server/handler/loader');

module.exports = function(Episode) {
  
  // Bind methods
  Episode.search = handler(INTERFACE, TOKEN_P2P, MODEL).search; 

  // Remote methods     
  Episode.remoteMethod(
    'search', 
    {
       accepts: [
         {arg: 'query', type: 'string'},
         {arg: 'mode', type: 'string', default:'sync'},
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/' + INTERFACE + '/' + TOKEN_P2P + '/search', verb: 'get'}
    }
  ); 


  // Operation hooks
  Episode.observe('before save', function filterProperties(ctx, next) {
    handler(INTERFACE, TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

};
