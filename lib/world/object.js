(function() {
  var EventEmitter, WorldObject;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  EventEmitter = require('events').EventEmitter;
  WorldObject = function() {
    function WorldObject(world) {
      this.world = world;
    }
    __extends(WorldObject, EventEmitter);
    WorldObject.prototype.world = null;
    WorldObject.prototype.idx = null;
    WorldObject.prototype.updatePriority = 0;
    WorldObject.prototype.spawn = function() {};
    WorldObject.prototype.update = function() {};
    WorldObject.prototype.destroy = function() {};
    WorldObject.prototype.ref = function(attribute, other) {
      var r, _ref, _ref2;
      if (((_ref = this[attribute]) != null ? _ref.$ : void 0) === other) {
        return this[attribute];
      }
      if ((_ref2 = this[attribute]) != null) {
        _ref2.clear();
      }
      if (!other) {
        return;
      }
      this[attribute] = r = {
        $: other,
        owner: this,
        attribute: attribute
      };
      r.events = {};
      r.on = function(event, listener) {
        var _base;
        other.on(event, listener);
        ((_base = r.events)[event] || (_base[event] = [])).push(listener);
        return r;
      };
      r.clear = function() {
        var event, listener, listeners, _i, _len, _ref;
        _ref = r.events;
        for (event in _ref) {
          if (!__hasProp.call(_ref, event)) continue;
          listeners = _ref[event];
          for (_i = 0, _len = listeners.length; _i < _len; _i++) {
            listener = listeners[_i];
            other.removeListener(event, listener);
          }
        }
        r.owner.removeListener('finalize', r.clear);
        return r.owner[r.attribute] = null;
      };
      r.on('finalize', r.clear);
      r.owner.on('finalize', r.clear);
      return r;
    };
    return WorldObject;
  }();
  module.exports = WorldObject;
}).call(this);
