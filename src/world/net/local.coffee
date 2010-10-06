BaseWorld = require '../base'


## NetLocalWorld

# Similar to `LocalWorld`, but it emits more signals, so that games built around networking can
# also depend on a local world getting the same signals.
class NetLocalWorld extends BaseWorld

  spawn: (type, args...) ->
    obj = @insert new type(this)
    obj.spawn(args...)
    obj.anySpawn
    obj

  update: (obj) ->
    obj.update()
    obj.emit 'update'
    obj.emit 'anyUpdate'
    obj

  destroy: (obj) ->
    obj.destroy()
    obj.emit 'destroy'
    obj.emit 'finalize'
    @remove obj
    obj


## Exports

module.exports = NetLocalWorld
