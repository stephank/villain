{EventEmitter}  = require 'events'


# The types indexed by their charId.
types = {}

## WorldObject

# The base class for all objects living in the game world.
class WorldObject extends EventEmitter
  # The back-reference to the `World`.
  world: null

  # An index in the world object list for this object.
  idx: null

  # The `updatePriority` is an arbitrary value that is used to determine the order in which objects
  # are updated. Objects are sorted in descending order of priority, so high priority objects get
  # updated before others.
  updatePriority: 0

  # Instantiating a `WorldObject` is done using `world.spawn(MyObject, params...);`. This wraps the
  # call to the actual constructor, and the world can thus keep track of the object.
  #
  # Any `spawn` parameters are passed to the `spawn` method of this object. The constructor itself
  # is usually bare-bones, only receiving and setting the `sim` attribute, and adding listeners.
  constructor: (@world) ->

  #### Abstract methods

  # These methods are called at key moments during the object's life span. They are called before
  # the related events are emitted. All of these are optional to implement.

  spawn: ->
  update: ->
  destroy: ->

  #### Events

  # You can install listeners for any of the following events in the constructor, or through
  # references from within other objects:
  #
  # * `spawn`
  # * `update`
  # * `destroy`
  #
  # These are called after the related methods defined above.

  # There is also a special event:
  #
  # * `finalize`
  #
  # The finalize event is called when you can be completely sure the object is gone. This is more
  # definitive than `destroy` for example, because networking may still revive an object after
  # such an event.

  #### Helpers

  # This helper is used to track references to other objects. The idea is to keep track of events
  # installed on the other object, which directly or indirectly (through a closure) hold a
  # back-reference. If we go away, or the reference is cleared, these listeners will be cleaned
  # up as well.
  #
  # We can't really create proxies in JavaScript (yet), so this tries to make things as painless
  # as possible. The `attribute` of this object is set to a thin wrapper. You may dereference
  # simply by doing: `@other.$.something`. However, to add an event listener on the other object
  # you don't dereference, but instead do: `@other.on 'someEvent', someHandler`.
  ref: (attribute, other) ->
    return this[attribute] if this[attribute]?.$ == other
    this[attribute]?.clear()
    return unless other
    this[attribute] = r = { $: other, owner: this, attribute }

    r.events = {}
    r.on = (event, listener) ->
      other.on event, listener
      (r.events[event] ||= []).push listener
      r

    r.clear = ->
      for event, listeners of r.events
        for listener in listeners
          other.removeListener event, listener
      r.owner.removeListener 'finalize', r.clear
      r.owner[r.attribute] = null
    r.on 'finalize', r.clear
    r.owner.on 'finalize', r.clear

    r


## Exports

module.exports = WorldObject
