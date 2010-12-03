(function() {
  var BaseWorld, NetLocalWorld;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  BaseWorld = require('../base');
  NetLocalWorld = function() {
    function NetLocalWorld() {
      NetLocalWorld.__super__.constructor.apply(this, arguments);
    }
    __extends(NetLocalWorld, BaseWorld);
    NetLocalWorld.prototype.spawn = function() {
      var args, obj, type;
      type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = this.insert(new type(this));
      obj.spawn.apply(obj, args);
      obj.anySpawn();
      return obj;
    };
    NetLocalWorld.prototype.update = function(obj) {
      obj.update();
      obj.emit('update');
      obj.emit('anyUpdate');
      return obj;
    };
    NetLocalWorld.prototype.destroy = function(obj) {
      obj.destroy();
      obj.emit('destroy');
      obj.emit('finalize');
      this.remove(obj);
      return obj;
    };
    return NetLocalWorld;
  }();
  module.exports = NetLocalWorld;
}).call(this);
