BaseWorld = require './base'


## LocalWorld

# The `World` for games that run only on the local machine is the simplest implementation.
# See `BaseWorld` for more detail on what a `World` provides.
class LocalWorld extends BaseWorld

  spawn: (type, args...) ->
    obj = @insert new type(this)
    obj.spawn(args...)
    obj

  update: (obj) ->
    obj.update()
    obj.emit 'update'
    obj

  destroy: (obj) ->
    obj.destroy()
    obj.emit 'destroy'
    obj.emit 'finalize'
    @remove obj
    obj


## Exports

module.exports = LocalWorld
