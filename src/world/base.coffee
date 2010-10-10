## BaseWorld

# An instance of `World` represents the game world. It's a container that keeps track of everything
# happening in the game simulation. The `BaseWorld` class is the base class of the different kinds
# of `World`.
class BaseWorld

  constructor: ->
    @objects = []

  #### Basic object management

  # Calling `tick` processes a single simulation step.
  tick: ->
    for obj in @objects.slice(0)
      @update obj
    return

  # These are methods that allow low-level manipulation of the object list, while keeping it
  # properly sorted, and keeping object indices up-to-date. Unless you're doing something special,
  # you will want to use `spawn` and `destroy` instead.

  insert: (obj) ->
    for other, i in @objects
      break if obj.updatePriority > other.updatePriority
    @objects.splice(i, 0, obj)
    for i in [i...@objects.length]
      @objects[i].idx = i
    obj

  remove: (obj) ->
    @objects.splice(obj.idx, 1)
    for i in [obj.idx...@objects.length]
      @objects[i].idx = i
    obj.idx = null
    obj

  #### Abstract methods

  # The `registerType` method registers a type of object with the world. It is usually called on
  # the prototype of the `World`.
  registerType: (type) ->

  # An object is added to the world with `world.spawn(MyObject, params...);`. The first parameter
  # is the type of object to spawn, and further arguments will be passed to the `spawn` method of
  # the object itself.
  spawn: (type, args...) ->

  # With the `update` method, a single world object is updated and the proper events are emitted.
  # This is called in a loop from `tick`, which is what you usually want to call instead.
  update: (obj) ->

  # To remove an object from the world, pass it to this `destroy` method.
  destroy: (obj) ->


## Exports

module.exports = BaseWorld
