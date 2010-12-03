(function() {
  var Loop;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Loop = function() {
    function Loop(handler) {
      this.handler = handler;
      this.timer = null;
    }
    Loop.prototype.tickRate = 50;
    Loop.prototype.start = function() {
      var last;
      if (this.timer) {
        return;
      }
      last = Date.now();
      this.timer = setInterval(__bind(function() {
        var now;
        now = Date.now();
        while (now - last >= this.tickRate) {
          this.handler.tick();
          last += this.tickRate;
        }
        return this.handler.idle();
      }, this), this.tickRate);
      return;
    };
    Loop.prototype.stop = function() {
      if (!this.timer) {
        return;
      }
      clearInterval(this.timer);
      return this.timer = null;
    };
    return Loop;
  }();
  module.exports = Loop;
}).call(this);
