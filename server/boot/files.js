var fs = require('fs');
var path = require('path');
//@TODO: refactoo get confi
var config = require('../handler/config');
module.exports = function(app) {
  var Serie = app.models.Serie;
  var options = config.image.options;
  app.use('/images/serie/:id/:token', function (req, res, next) {
    Serie.findById(req.params.id, function (err, serie) {
      var filePath = path.join(options.directory, serie.Name, req.params.token + '.jpg');
      fs.access(filePath, fs.F_OK, function(err) {
        if (!err) {
          // Do something
          var rs = fs.createReadStream(filePath);
          rs.pipe(res);
        } else {
          // It isn't accessible
          next(err);
        }
      });
    })
  });
};
