BaseWorld = require '../base'
{unpack, buildUnpacker} = require '../../struct'


## ClientWorld

# The `World` implementation on the client runs both a local simulation and handles synchronization
# with the world state living on the server.
class ClientWorld extends BaseWorld

  # The client receives character code identifiers for object types. In order to find the object
  # type belonging to a code, a registry is needed.

  registerType: (type) ->
    @types = [] unless @hasOwnProperty 'types'
    @types.push type

  # The following are implementations of abstract `BaseWorld` methods for the client. Any
  # world simulation done on the client is only to make the game appear smooth at low latencies
  # or network interruptions. The client thus has to keep track of changes it makes, so that it
  # can always return to a state where it is synchronized with the server.

  constructor: ->
    super
    @changes = []

  spawn: (type, args...) ->
    obj = @insert new type(this)
    @changes.unshift ['create', obj.idx, obj]
    obj._net_transient = yes
    obj.spawn(args...)
    obj.anySpawn()
    obj

  update: (obj) ->
    obj.update()
    obj.emit 'update'
    obj.emit 'anyUpdate'
    obj

  destroy: (obj) ->
    @changes.unshift ['destroy', obj.idx, obj]
    @remove obj
    obj.emit 'destroy'
    obj.emit 'finalize' if obj._net_transient
    obj

  #### Object synchronization

  # These methods are responsible for performing the synchronization based on messages received
  # from the server. When processing messages, networking calls the `netSpawn`, `netTick` and
  # `netDestroy` methods. Each of these take the raw message data, process it, then return the
  # number of bytes they used.

  # Before newly received messages are processed, `netRestore()` is called. This method takes care
  # of reverting any local changes that were made on the client.
  netRestore: ->
    return unless @changes.length > 0
    for [type, idx, obj] in @changes
      switch type
        when 'create'
          obj.emit 'finalize' if obj.transient and not obj._net_revived
          @objects.splice idx, 1
        when 'destroy'
          obj._net_revived = yes
          @objects.splice idx, 0, obj
    @changes = []
    for obj, i in @objects
      obj.idx = i
    return

  # Networking code adds objects to the network using `netSpawn`. This method creates the object,
  # but leaves it bare-bones otherwise. State for the new object is received in the upcoming
  # update message, at which point events are emitted.
  netSpawn: (data, offset) ->
    type = @types[data[offset]]
    # assert: type != undefined
    obj = @insert new type(this)
    obj._net_transient = no
    obj._net_new = yes
    1

  # The `netUpdate` method asks a single object to deserialize state from the given data, and emits
  # the proper events. This is called in a loop from `netTick`, which is what you usually want to
  # call instead.
  netUpdate: (obj, data, offset) ->
    [bytes, changes] = @deserialize(obj, data, offset, obj._net_new)
    if obj._net_new
      obj.netSpawn()
      obj.anySpawn()
      obj._net_new = no
    else
      obj.emit 'netUpdate', changes
      obj.emit 'anyUpdate'
    obj.emit 'netSync'
    bytes

  # Networking code can remove objects from the world with the `netDestroy` method.
  netDestroy: (data, offset) ->
    [[obj_idx], bytes] = unpack('H', data, offset)
    obj = @objects[obj_idx]
    unless obj._net_new
      obj.emit 'netDestroy'
      obj.emit 'anyDestroy'
      obj.emit 'finalize'
    @remove obj
    bytes

  # A complete update of state for all objects is passed to `netTick`. It is assumed at this point
  # that the object list on the server and client are the same. Thus, this method expects a stream
  # of serialized object state, which it walks through, calling `netUpdate` for each object and
  # the relevant chunk of data from the stream.
  netTick: (data, offset) ->
    bytes = 0
    for obj in @objects
      bytes += @netUpdate obj, data, offset + bytes
    bytes

  # The `deserialize` helper builds the generator used for deserialization and passes it to the
  # `serialization` method of `object`. It wraps `struct.unpacker` with the function signature
  # that we want, and also adds the necessary support to process the `O` format specifier.
  deserialize: (obj, data, offset, isCreate) ->
    unpacker = buildUnpacker(data, offset)
    changes = {}
    obj.serialization isCreate, (specifier, attribute, options) =>
      options ||= {}
      if specifier == 'O'
        other = @objects[unpacker('H')]
        if (oldValue = obj[attribute]?.$) != other
          changes[attribute] = oldValue
          obj.ref attribute, other
      else
        value = unpacker(specifier)
        value = options.rx(value) if options.rx?
        if (oldValue = obj[attribute]) != value
          changes[attribute] = oldValue
          obj[attribute] = value
      return
    [unpacker.finish(), changes]


## Exports
module.exports = ClientWorld
