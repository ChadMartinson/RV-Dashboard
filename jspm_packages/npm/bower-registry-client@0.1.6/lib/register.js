/* */ 
var parseUrl = require("url").parse;
var request = require("request");
var createError = require("./util/createError");
function register(name, url, callback) {
  var config = this._config;
  var requestUrl = config.registry.register + '/packages';
  var remote = parseUrl(requestUrl);
  var headers = {};
  if (config.userAgent) {
    headers['User-Agent'] = config.userAgent;
  }
  request.post({
    url: requestUrl,
    proxy: remote.protocol === 'https:' ? config.httpsProxy : config.proxy,
    headers: headers,
    ca: config.ca.register,
    strictSSL: config.strictSsl,
    timeout: config.timeout,
    json: true,
    form: {
      name: name,
      url: url
    }
  }, function(err, response) {
    if (err) {
      return callback(createError('Request to ' + requestUrl + ' failed: ' + err.message, err.code));
    }
    if (response.statusCode === 406) {
      return callback(createError('Duplicate package', 'EDUPLICATE'));
    }
    if (response.statusCode === 400) {
      return callback(createError('Invalid URL format', 'EINVFORMAT'));
    }
    if (response.statusCode !== 201) {
      return callback(createError('Unknown error: ' + response.statusCode, 'EUNKNOWN'));
    }
    callback(null, {
      name: name,
      url: url
    });
  });
}
module.exports = register;
