(function() {
  var BaseWorld, ClientWorld, buildUnpacker, unpack, _ref;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  BaseWorld = require('../base');
  _ref = require('../../struct'), unpack = _ref.unpack, buildUnpacker = _ref.buildUnpacker;
  ClientWorld = function() {
    function ClientWorld() {
      ClientWorld.__super__.constructor.apply(this, arguments);
      this.changes = [];
    }
    __extends(ClientWorld, BaseWorld);
    ClientWorld.prototype.registerType = function(type) {
      if (!this.hasOwnProperty('types')) {
        this.types = [];
      }
      return this.types.push(type);
    };
    ClientWorld.prototype.spawn = function() {
      var args, obj, type;
      type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = this.insert(new type(this));
      this.changes.unshift(['create', obj.idx, obj]);
      obj._net_transient = true;
      obj.spawn.apply(obj, args);
      obj.anySpawn();
      return obj;
    };
    ClientWorld.prototype.update = function(obj) {
      obj.update();
      obj.emit('update');
      obj.emit('anyUpdate');
      return obj;
    };
    ClientWorld.prototype.destroy = function(obj) {
      this.changes.unshift(['destroy', obj.idx, obj]);
      this.remove(obj);
      obj.emit('destroy');
      if (obj._net_transient) {
        obj.emit('finalize');
      }
      return obj;
    };
    ClientWorld.prototype.netRestore = function() {
      var i, idx, obj, type, _i, _len, _len2, _ref, _ref2, _ref3;
      if (this.changes.length <= 0) {
        return;
      }
      _ref = this.changes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref2 = _ref[_i], type = _ref2[0], idx = _ref2[1], obj = _ref2[2];
        switch (type) {
          case 'create':
            if (obj.transient && !obj._net_revived) {
              obj.emit('finalize');
            }
            this.objects.splice(idx, 1);
            break;
          case 'destroy':
            obj._net_revived = true;
            this.objects.splice(idx, 0, obj);
        }
      }
      this.changes = [];
      _ref3 = this.objects;
      for (i = 0, _len2 = _ref3.length; i < _len2; i++) {
        obj = _ref3[i];
        obj.idx = i;
      }
      return;
    };
    ClientWorld.prototype.netSpawn = function(data, offset) {
      var obj, type;
      type = this.types[data[offset]];
      obj = this.insert(new type(this));
      obj._net_transient = false;
      obj._net_new = true;
      return 1;
    };
    ClientWorld.prototype.netUpdate = function(obj, data, offset) {
      var bytes, changes, _ref;
      _ref = this.deserialize(obj, data, offset, obj._net_new), bytes = _ref[0], changes = _ref[1];
      if (obj._net_new) {
        obj.netSpawn();
        obj.anySpawn();
        obj._net_new = false;
      } else {
        obj.emit('netUpdate', changes);
        obj.emit('anyUpdate');
      }
      obj.emit('netSync');
      return bytes;
    };
    ClientWorld.prototype.netDestroy = function(data, offset) {
      var bytes, obj, obj_idx, _ref;
      _ref = unpack('H', data, offset), obj_idx = _ref[0][0], bytes = _ref[1];
      obj = this.objects[obj_idx];
      if (!obj._net_new) {
        obj.emit('netDestroy');
        obj.emit('anyDestroy');
        obj.emit('finalize');
      }
      this.remove(obj);
      return bytes;
    };
    ClientWorld.prototype.netTick = function(data, offset) {
      var bytes, obj, _i, _len, _ref;
      bytes = 0;
      _ref = this.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        bytes += this.netUpdate(obj, data, offset + bytes);
      }
      return bytes;
    };
    ClientWorld.prototype.deserialize = function(obj, data, offset, isCreate) {
      var changes, unpacker;
      unpacker = buildUnpacker(data, offset);
      changes = {};
      obj.serialization(isCreate, __bind(function(specifier, attribute, options) {
        var oldValue, other, value, _ref;
        options || (options = {});
        if (specifier === 'O') {
          other = this.objects[unpacker('H')];
          if ((oldValue = (_ref = obj[attribute]) != null ? _ref.$ : void 0) !== other) {
            changes[attribute] = oldValue;
            obj.ref(attribute, other);
          }
        } else {
          value = unpacker(specifier);
          if (options.rx != null) {
            value = options.rx(value);
          }
          if ((oldValue = obj[attribute]) !== value) {
            changes[attribute] = oldValue;
            obj[attribute] = value;
          }
        }
        return;
      }, this));
      return [unpacker.finish(), changes];
    };
    return ClientWorld;
  }();
  module.exports = ClientWorld;
}).call(this);
