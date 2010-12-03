(function() {
  var NetWorldObject, WorldObject;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  WorldObject = require('../object');
  NetWorldObject = function() {
    function NetWorldObject() {
      NetWorldObject.__super__.constructor.apply(this, arguments);
    }
    __extends(NetWorldObject, WorldObject);
    NetWorldObject.prototype.charId = null;
    NetWorldObject.prototype.serialization = function(isCreate, p) {};
    NetWorldObject.prototype.netSpawn = function() {};
    NetWorldObject.prototype.anySpawn = function() {};
    return NetWorldObject;
  }();
  module.exports = NetWorldObject;
}).call(this);
