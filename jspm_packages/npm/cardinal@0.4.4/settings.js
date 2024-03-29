/* */ 
(function(process) {
  var path = require("path"),
      util = require("util"),
      fs = require("fs"),
      utl = require("./utl"),
      home = process.env.HOME,
      settings;
  function getSettings(home_) {
    if (settings)
      return settings;
    try {
      settingsJson = fs.readFileSync(path.join(home_ || home, '.cardinalrc'), 'utf-8');
    } catch (_) {
      return undefined;
    }
    try {
      return JSON.parse(settingsJson);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
  function resolveTheme(home_) {
    var themePath,
        settings = getSettings(home_);
    if (!settings || !settings.theme)
      return undefined;
    try {
      themePath = utl.isPath(settings.theme) ? settings.theme : path.join(__dirname, 'themes', settings.theme);
      return require(themePath);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
  module.exports = {
    resolveTheme: resolveTheme,
    getSettings: getSettings
  };
})(require("process"));
