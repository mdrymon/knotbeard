var CronJob = require('cron').CronJob;
var models = require(process.env.PWD + '/server/server.js').models;
var async = require('async');

var job = new CronJob('*/40 * * * * *', function() {
console.log('MODELS', Object.keys(models));
  models.Episode.runTorrent(5, function (err, instance) { 
    async.each(Object.keys(models), function(modelName) {
      models[modelName].destroyAll(function (err) {
        console.log('model cleaned!')
      });
    }, function(err) {
      console.log(err || "job's finished!");
    });
console.log('DO?NE');
  });
  
}, null, true, 'Europe/Paris');
