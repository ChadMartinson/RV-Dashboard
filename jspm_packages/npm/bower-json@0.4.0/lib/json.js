/* */ 
var fs = require("graceful-fs");
var path = require("path");
var deepExtend = require("deep-extend");
var isComponent = require("./util/isComponent");
var createError = require("./util/createError");
var possibleJsons = ['bower.json', 'component.json', '.bower.json'];
function read(file, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  fs.stat(file, function(err, stat) {
    if (err) {
      return callback(err);
    }
    if (stat.isDirectory()) {
      return find(file, function(err, file) {
        if (err) {
          return callback(err);
        }
        read(file, options, callback);
      });
    }
    fs.readFile(file, function(err, contents) {
      var json;
      if (err) {
        return callback(err);
      }
      try {
        json = JSON.parse(contents.toString());
      } catch (err) {
        err.file = path.resolve(file);
        err.code = 'EMALFORMED';
        return callback(err);
      }
      try {
        json = parse(json, options);
      } catch (err) {
        err.file = path.resolve(file);
        return callback(err);
      }
      callback(null, json, file);
    });
  });
}
function parse(json, options) {
  options = deepExtend({
    normalize: false,
    validate: true,
    clone: false
  }, options || {});
  if (options.clone) {
    json = deepExtend({}, json);
  }
  if (options.validate) {
    validate(json);
  }
  if (options.normalize) {
    normalize(json);
  }
  return json;
}
function validate(json) {
  if (!json.name) {
    throw createError('No name property set', 'EINVALID');
  }
  return json;
}
function normalize(json) {
  if (typeof json.main === 'string') {
    json.main = json.main.split(',');
  }
  return json;
}
function find(folder, files, callback) {
  var err;
  var file;
  if (typeof files === 'function') {
    callback = files;
    files = possibleJsons;
  }
  if (!files.length) {
    err = createError('None of ' + possibleJsons.join(', ') + ' were found in ' + folder, 'ENOENT');
    return callback(err);
  }
  file = path.resolve(path.join(folder, files[0]));
  fs.exists(file, function(exists) {
    if (!exists) {
      return find(folder, files.slice(1), callback);
    }
    if (files[0] !== 'component.json') {
      return callback(null, file);
    }
    isComponent(file, function(is) {
      if (is) {
        return find(folder, files.slice(1), callback);
      }
      callback(null, file);
    });
  });
}
module.exports = read;
module.exports.read = read;
module.exports.parse = parse;
module.exports.validate = validate;
module.exports.normalize = normalize;
module.exports.find = find;
