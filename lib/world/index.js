(function() {
  var BaseWorld, LocalWorld;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  BaseWorld = require('./base');
  LocalWorld = function() {
    function LocalWorld() {
      LocalWorld.__super__.constructor.apply(this, arguments);
    }
    __extends(LocalWorld, BaseWorld);
    LocalWorld.prototype.spawn = function() {
      var args, obj, type;
      type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = this.insert(new type(this));
      obj.spawn.apply(obj, args);
      return obj;
    };
    LocalWorld.prototype.update = function(obj) {
      obj.update();
      obj.emit('update');
      return obj;
    };
    LocalWorld.prototype.destroy = function(obj) {
      obj.destroy();
      obj.emit('destroy');
      obj.emit('finalize');
      this.remove(obj);
      return obj;
    };
    return LocalWorld;
  }();
  module.exports = LocalWorld;
}).call(this);
