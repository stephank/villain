# Look for a native version of requestAnimationFrame, or deal with the situation.
# We export the actual functions we use so that they can be overridden.
do ->
  if window?
    if actualRAF = window.requestAnimationFrame
      actualCAF = window.cancelAnimationFrame ||
                  window.cancelRequestAnimationFrame

    else
      # Look for a prefixed version.
      for prefix in ['moz', 'webkit', 'ms', 'o']
        if actualRAF = window["#{prefix}RequestAnimationFrame"]
          actualCAF = window["#{prefix}CancelAnimationFrame"] ||
                      window["#{prefix}CancelRequestAnimationFrame"]
          break

      # Emulate by calling back immediately. No handle is returned.
      unless actualRAF
        actualRAF = (callback) ->
          callback()
          return null

        actualCAF = (timeout) ->
          return null

  else
    # Assume Node.js.
    actualRAF = process.nextTick
    actualCAF = null

  # If the request is not cancellable, deal with it by adding some state.
  unless actualCAF
    exports.requestAnimationFrame = (callback) ->
      state = active: yes
      actualRAF () -> callback() if state.active
      return state

    exports.cancelAnimationFrame = (state) ->
      state.active = no

  else
    exports.requestAnimationFrame = actualRAF
    exports.cancelAnimationFrame = actualCAF


# Create a loop. Only takes options, and returns a handle object
# with `start` and `stop` methods. The options are:
#
#  - `rate`: tick rate in milliseconds between ticks.
#  - `tick`: function called for each tick.
#  - `idle`: function called between tick processing, (not necessarily every tick.)
#  - `frame`: function called at the browser's convenience to render a frame.
#
exports.createLoop = (options={}) ->
  lastTick = timerReq = frameReq = null

  # `setTimeout` callback.
  timerCallback = ->
    timerReq = null

    # Simulate remaining ticks. We run ticks at a fixed rate, regardless of the actual timer
    # rate. We also allow for adjustments in rate, even between ticks inside this callback,
    # hence and always reference `options`.
    now = Date.now()
    while now - lastTick >= options.rate
      options.tick()
      lastTick += options.rate
    options.idle?()

    # Schedule a frame, but only if we have a frame callback.
    if options.frame and !frameReq
      frameReq = exports.requestAnimationFrame frameCallback

    # Schedule next run. Use setTimeout so that the tick rate may be adjusted at runtime. Also
    # has the advantage of stopping to loop when things go awry.
    timerReq = setTimeout timerCallback, options.rate

  # `requestAnimationFrame` callback.
  frameCallback = ->
    frameReq = null

    options.frame()

  # Handle and interface.
  handle =
    start: ->
      unless timerReq
        lastTick = Date.now()
        timerReq = setTimeout timerCallback, options.rate

    stop: ->
      if timerReq
        clearInterval timerReq
        timerReq = null

      if frameReq
        exports.cancelAnimationFrame frameReq
        frameReq = null

  return handle
