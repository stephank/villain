(function() {
  var fs, path;
  fs = require('fs');
  path = require('path');
  exports.VERSION = '0.1.3';
  exports.getLibraryPath = function() {
    return path.dirname(fs.realpathSync(__filename));
  };
}).call(this);
