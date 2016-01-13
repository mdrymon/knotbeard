var TOKEN_DB = 'database';
var TOKEN_P2P = 'torrent';
var TOKEN_PARSE = 'parser';
var TOKEN_DL = 'download';
var TOKEN_SC = 'scan';
var TOKEN_MV = 'move';
var MODEL = 'episode';
//@TODO:get path root
var handler = require(process.env.PWD + '/server/handler/loader');

module.exports = function(Episode) {
  
  // Bind methods
  Episode.search = handler(TOKEN_P2P, MODEL).search;
  Episode.torrent = handler(TOKEN_PARSE, MODEL).torrent;
  Episode.process = handler(TOKEN_DL, MODEL).process;
  Episode.finder = handler(TOKEN_SC, MODEL).find;
  Episode.move = handler(TOKEN_MV, MODEL).move;

  // Remote methods     
  Episode.remoteMethod(
    'search', 
    {
       accepts: [
         {arg: 'query', type: 'string'},
         {arg: 'mode', type: 'string', default:'sync'},
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/handler/' + TOKEN_P2P + '/search', verb: 'get'}
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
       http: {path: '/handler/' + TOKEN_PARSE + '/torrent', verb: 'get'}
    }
  ); 
  Episode.remoteMethod(
    'process', 
    {
       accepts: [
         {arg: 'link', type: 'string'},
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/handler/' + TOKEN_DL + '/process', verb: 'post'}
    }
  ); 
  Episode.remoteMethod(
    'finder', 
    {
       accepts: [
         {arg: 'exp', type: 'object'},
       ],
       returns: {arg: 'responses', type: 'object'},
       http: {path: '/handler/' + TOKEN_SC + '/find', verb: 'get'}
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
       http: {path: '/handler/' + TOKEN_MV + '/file', verb: 'post'}
    }
  ); 

  // Operation hooks
  Episode.observe('before save', function filterProperties(ctx, next) {
    handler(TOKEN_DB, MODEL).instanceAlter(ctx.instance);
    next();
  });

};
