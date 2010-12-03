(function() {
  var BaseWorld;
  var __slice = Array.prototype.slice;
  BaseWorld = function() {
    function BaseWorld() {
      this.objects = [];
    }
    BaseWorld.prototype.tick = function() {
      var obj, _i, _len, _ref;
      _ref = this.objects.slice(0);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        this.update(obj);
      }
      return;
    };
    BaseWorld.prototype.insert = function(obj) {
      var i, other, _len, _ref, _ref2;
      _ref = this.objects;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        other = _ref[i];
        if (obj.updatePriority > other.updatePriority) {
          break;
        }
      }
      this.objects.splice(i, 0, obj);
      for (i = i, _ref2 = this.objects.length; (i <= _ref2 ? i < _ref2 : i > _ref2); (i <= _ref2 ? i += 1 : i -= 1)) {
        this.objects[i].idx = i;
      }
      return obj;
    };
    BaseWorld.prototype.remove = function(obj) {
      var i, _ref, _ref2;
      this.objects.splice(obj.idx, 1);
      for (i = _ref = obj.idx, _ref2 = this.objects.length; (_ref <= _ref2 ? i < _ref2 : i > _ref2); (_ref <= _ref2 ? i += 1 : i -= 1)) {
        this.objects[i].idx = i;
      }
      obj.idx = null;
      return obj;
    };
    BaseWorld.prototype.registerType = function(type) {};
    BaseWorld.prototype.spawn = function() {
      var args, type;
      type = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    };
    BaseWorld.prototype.update = function(obj) {};
    BaseWorld.prototype.destroy = function(obj) {};
    return BaseWorld;
  }();
  module.exports = BaseWorld;
}).call(this);
