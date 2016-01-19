var fs = require('fs');
var path = require('path');
//@TODO: refactoo get confi
var config = require('../handler/config');
module.exports = function(app) {
  var Serie = app.models.Serie;
  var options = config.image.options;
  app.use('/images/serie/:id/:token', function (req, res, next) {
    Serie.findById(req.params.id, function (err, serie) {
      var rs = fs.createReadStream(path.join(options.directory, serie.Name, req.params.token + '.jpg'));
      rs.pipe(res);
    })
  });
};
