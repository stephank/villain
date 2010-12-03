(function() {
  var BaseWorld, ServerWorld, buildPacker, pack, _ref;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  BaseWorld = require('../base');
  _ref = require('../../struct'), pack = _ref.pack, buildPacker = _ref.buildPacker;
  ServerWorld = function() {
    function ServerWorld() {
      ServerWorld.__super__.constructor.apply(this, arguments);
      this.changes = [];
    }
    __extends(ServerWorld, BaseWorld);
    ServerWorld.prototype.registerType = function(type) {
      if (!this.hasOwnProperty('typeIdxCounter')) {
        this.typeIdxCounter = 0;
      }
      return type.prototype._net_type_idx = this.typeIdxCounter++;
    };
    ServerWorld.prototype.spawn = function() {
      var args, obj, type;
      type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = this.insert(new type(this));
      this.changes.push(['create', obj, obj.idx]);
      obj._net_new = true;
      obj.spawn.apply(obj, args);
      obj.anySpawn();
      return obj;
    };
    ServerWorld.prototype.update = function(obj) {
      obj.update();
      obj.emit('update');
      return obj.emit('anyUpdate');
    };
    ServerWorld.prototype.destroy = function(obj) {
      this.changes.push(['destroy', obj, obj.idx]);
      this.remove(obj);
      obj.destroy();
      obj.emit('destroy');
      obj.emit('finalize');
      return obj;
    };
    ServerWorld.prototype.dump = function(obj, isInitial) {
      var isCreate;
      isCreate = isInitial || obj._net_new;
      obj._net_new = false;
      return this.serialize(obj, isCreate);
    };
    ServerWorld.prototype.dumpTick = function(isInitial) {
      var data, obj, _i, _len, _ref;
      data = [];
      _ref = this.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        data = data.concat(this.dump(obj, isInitial));
      }
      return data;
    };
    ServerWorld.prototype.serialize = function(obj, isCreate) {
      var packer;
      packer = buildPacker();
      obj.serialization(isCreate, function(specifier, attribute, options) {
        var value;
        options || (options = {});
        value = obj[attribute];
        if (options.tx != null) {
          value = options.tx(value);
        }
        if (specifier === 'O') {
          packer('H', value ? value.$.idx : 65535);
        } else {
          packer(specifier, value);
        }
        return;
      });
      return packer.finish();
    };
    return ServerWorld;
  }();
  module.exports = ServerWorld;
}).call(this);
