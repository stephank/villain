WorldObject = require '../object'


## NetWorldObject

# This is the base class for all world objects used in network synchronized games. It contains
# several required extensions on top of `WorldObject`.
class NetWorldObject extends WorldObject
  # This is a single character identifier for this class. It is used as the type identifier on the
  # wire when transmitted to clients.
  charId: null

  #### Abstract methods

  # `serialization` is called to serialize and deserialize an object's state. The parameter `p`
  # is a function which should be repeatedly called for each property of the object. It takes as
  # its first parameter a format specifier for `struct`, and as its second parameter an attribute
  # name.
  #
  # A special format specifier `O` may be used to (de-)serialize a reference to another object.
  #
  # There are also two options, `tx` and `rx`, that can be specified when calling `p`. Each of
  # these is a function that transforms the attribute value before sending and receiving
  # respectively.
  #
  # The `isCreate` parameter is true if called in response to a create message. This can be used to
  # synchronize parameters that are only ever set once at construction.
  #
  # If the function is called to serialize, then attributes are collected to form a packet.
  # If the function is called to deserialize, then attributes are filled with new values.
  serialization: (isCreate, p) ->

  # `netSpawn` is called after an object was instantiated and deserialized from the network.
  netSpawn: ->

  # The `anySpawn` method is a convenience called after both `spawn` and `netSpawn`.
  anySpawn: ->

  #### Events

  # In addition to the events defined in `WorldObject`, we define:
  #
  # * `netUpdate`
  #
  # For your convenience, these aggregate events will also be emitted:
  #
  # * `anyUpdate` after both `update` and `netUpdate`.
  # * `netSync` after both a `netSpawn` and `netUpdate`.


## Exports

module.exports = NetWorldObject
