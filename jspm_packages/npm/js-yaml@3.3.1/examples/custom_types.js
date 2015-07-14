/* */ 
(function(process) {
  'use strict';
  var fs = require("fs");
  var path = require("path");
  var util = require("util");
  var yaml = require("../lib/js-yaml");
  function Point(x, y, z) {
    this.klass = 'Point';
    this.x = x;
    this.y = y;
    this.z = z;
  }
  function Space(height, width, points) {
    if (points) {
      if (!points.every(function(point) {
        return point instanceof Point;
      })) {
        throw new Error('A non-Point inside a points array!');
      }
    }
    this.klass = 'Space';
    this.height = height;
    this.width = width;
    this.points = points;
  }
  var PointYamlType = new yaml.Type('!point', {
    kind: 'sequence',
    resolve: function(data) {
      return data !== null && data.length === 3;
    },
    construct: function(data) {
      return new Point(data[0], data[1], data[2]);
    },
    instanceOf: Point,
    represent: function(point) {
      return [point.x, point.y, point.z];
    }
  });
  var SpaceYamlType = new yaml.Type('!space', {
    kind: 'mapping',
    construct: function(data) {
      data = data || {};
      return new Space(data.height || 0, data.width || 0, data.points || []);
    },
    instanceOf: Space
  });
  var SPACE_SCHEMA = yaml.Schema.create([SpaceYamlType, PointYamlType]);
  if (require.main === module) {
    fs.readFile(path.join(__dirname, 'custom_types.yml'), 'utf8', function(error, data) {
      var loaded;
      if (!error) {
        loaded = yaml.load(data, {schema: SPACE_SCHEMA});
        console.log(util.inspect(loaded, false, 20, true));
      } else {
        console.error(error.stack || error.message || String(error));
      }
    });
  }
  module.exports.Point = Point;
  module.exports.Space = Space;
  module.exports.PointYamlType = PointYamlType;
  module.exports.SpaceYamlType = SpaceYamlType;
  module.exports.SPACE_SCHEMA = SPACE_SCHEMA;
})(require("process"));
