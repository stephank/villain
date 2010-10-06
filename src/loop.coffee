## Loop

# A simple class that manages a game loop running at a fixed rate. To use, simply create a new
# instance and provide it with a handler-object. This object should expose `tick` and `idle`
# methods.
class Loop

  constructor: (@handler) ->
    @timer = null

  #### Loop controls

  # The number of milliseconds between ticks.
  # The default is 50 ms, which amounts to 20 ticks per second.
  tickRate: 50

  # Start the loop.
  # This starts an interval, and calls into `tick` and `idle` periodically.
  start: ->
    return if @timer
    last = Date.now()
    @timer = setInterval =>
      now = Date.now()
      while now - last >= @tickRate
        @handler.tick()
        last += @tickRate
      @handler.idle()
    , @tickRate
    return

  # Stop the loop.
  stop: ->
    return unless @timer
    clearInterval @timer
    @timer = null


## Exports
module.exports = Loop
