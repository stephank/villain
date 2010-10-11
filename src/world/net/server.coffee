BaseWorld = require '../base'
{pack, buildPacker} = require '../../struct'


## ServerWorld

# The `World` implementation on the server runs the authoritative simulation and prepares state
# updates that can be transmitted to clients.
class ServerWorld extends BaseWorld

  # The server transmits character code identifiers for object types. We cache the byte value of
  # these characters using the `registerType` prototype method.

  registerType: (type) ->
    @typeIdxCounter = 0 unless @hasOwnProperty 'typeIdxCounter'
    type::_net_type_idx = @typeIdxCounter++

  # The following are implementations of abstract `BaseWorld` methods for the server. Any
  # world simulation done on the server needs to be kept track of, so that the changes may be
  # transmitted to clients.

  constructor: ->
    super
    @changes = []

  spawn: (type, args...) ->
    obj = @insert new type(this)
    @changes.push ['create', obj._net_type_idx]
    obj._net_new = yes
    obj.spawn(args...)
    obj.anySpawn()
    obj

  update: (obj) ->
    obj.update()
    obj.emit 'update'
    obj.emit 'anyUpdate'

  destroy: (obj) ->
    @changes.push ['destroy', obj.idx]
    @remove obj
    obj.destroy()
    obj.emit 'destroy'
    obj.emit 'finalize'
    obj

  #### Object synchronization

  # Serializes an object's state into a data block to be sent to clients. The optional `isInitial`
  # flag should be set to force the `isCreate` flag to true in the `serialization` method. This is
  # useful when sending an initial update to clients.
  dump: (obj, isInitial) ->
    isCreate = isInitial or obj._net_new
    obj._net_new = no
    @serialize(obj, isCreate)

  # Serializes all objects' state into one large data block. This is used to send complete updates
  # for a single game tick, or the initial state packet.
  dumpTick: (isInitial) ->
    data = []
    for obj in @objects
      data = data.concat @dump(obj, isInitial)
    data

  # The `serialize` helper builds the generator used for serialization and passes it to the
  # `serialization` method of `object`. It wraps `struct.packer` with the function signature
  # that we want, and also adds the necessary support to process the `O` format specifier.
  serialize: (obj, isCreate) ->
    packer = buildPacker()
    obj.serialization isCreate, (specifier, attribute, options) ->
      options ||= {}
      value = obj[attribute]
      value = options.tx(value) if options.tx?
      if specifier == 'O'
        packer('H', if value then value.$.idx else 65535)
      else
        packer(specifier, value)
      return
    packer.finish()


## Exports

module.exports = ServerWorld
