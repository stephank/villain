# The implementation of the `villain` command-line application, which generates a basic project
# from a template.

sys = require 'sys'
fs  = require 'fs'
constants = require 'constants'
{VERSION} = require '../index'


## Arguments

abort = (msg) ->
  sys.error(msg)
  process.exit(1)

usage =
  """
    Usage: villain [options] PATH [PROJECT]

    PROJECT is a name for your project that will be used throughout the
    source code. You should specify a name in CamelCase.

    Options:
      -v, --version Output framework version
      -h, --help    Output help information
  """

args = process.argv.slice(2)
path = null; project = null
for arg in process.argv.slice(2)
  if arg == '-h' or arg == '--help'
    abort(usage)
  if arg == '-v' or arg == '--version'
    abort(VERSION)

  if project
    abort(usage)
  else if path
    project = arg
  else
    path = arg

abort(usage) unless path

unless project
  project = path.split('/').pop()
  project = project.split('_')
  project = for part in project
    part.charAt(0).toUpperCase() + part.slice(1)
  project = project.join('')
unless project.match /^[a-z_\$][a-z0-9_\$]+$/i
  abort(
    """
      '#{project}' is not a valid project name.
      The project name has to be a valid JavaScript variable name.
    """)
projectlc = project.toLowerCase()


## Templates

tmplCakefile =
  """
    # A basic Cakefile which compiles CoffeeScript sources for the server,
    # and packages them for the client in a single JavaScript bundle.

    villain = require 'villain/build/cake'

    # A task that recreates the `src/` directory structure under `lib/`, and
    # compiles any CoffeeScript in the process.
    task 'build:modules', 'Compile all #{project} modules', ->
      villain.compileDirectory 'src', 'lib'

    # A task that takes the modules from `build:modules`, and packages them
    # as a JavaScript bundle for shipping to the browser client.
    task 'build:client', 'Compile the #{project} client bundle', ->
      invoke 'build:modules'

      villain.simpleBundle 'public/#{projectlc}-bundle.js',
        '#{projectlc}/client': './lib/client/index.js'

    # The conventional default target.
    task 'build', 'Compile #{project}', ->
      invoke 'build:client'
  """

tmplServerLauncher =
  """
    #!/usr/bin/env node

    // This is the server executable.

    // First, find the path to our include directory.
    var path = require('path');
    var fs   = require('fs');
    var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');

    // Then, instantiate and start the server.
    var #{project}ServerWorld = require(lib + '/server');
    var server = new #{project}ServerWorld();
    server.start();
  """

tmplClientIndex =
  """
    ClientWorld = require 'villain/world/client'
    objects = require '../objects/all'


    class #{project}ClientWorld extends ClientWorld

    objects.registerWithWorld #{project}ClientWorld.prototype


    class Client

      constructor: ->
        @world = new #{project}ClientWorld()

      start: ->


    module.exports = Client
  """

tmplServerIndex =
  """
    ServerWorld = require 'villain/world/server'
    objects = require '../objects/all'


    class #{project}ServerWorld extends ServerWorld

    objects.registerWithWorld #{project}ServerWorld.prototype


    class Server

      constructor: ->
        @world = new #{project}ServerWorld()

      start: ->


    module.exports = Server
  """

tmplBaseObject =
  """
    NetWorldObject = require 'villain/world/net_object'


    # Your base class for all game objects.
    class #{project}Object extends NetWorldObject


    module.exports = #{project}Object
  """

tmplExampleObject =
  """
    #{project}Object = require '../object'


    # An example object, that doesn't really do anything.
    class Example extends #{project}Object

      spawn: (arg1, arg2) ->

      update: ->


    module.exports = Example
  """

tmplObjectsIndex =
  """
    # This is an index of all objects types in the game. It is important for
    # networking that objects are registered in the same order with the
    # `ServerWorld` on the server and the `ClientWorld` on the client.
    # Therefor, you want to use a function like this everywhere.
    exports.registerWithWorld = (w) ->
      w.registerType require './example'
  """

tmplIndexPage =
  """
    <!DOCTYPE html>
    <html>
    <head>
    <title>#{project}</title>
    <script src="#{projectlc}-bundle.js"></script>
    <script>
    (function(){
      var #{project}ClientWorld = require("#{projectlc}/client");
      var world = new #{project}ClientWorld();
      world.start();
    })();
    </script>
    </head>
    <body>
    </body>
    </html>
  """


## Build directory structure

# Whether the target directory exists and is empty.
emptyDirectory = ->
  empty = yes
  try
    empty = (fs.readdirSync(path).length == 0)
  catch e
    throw e unless e.errno == constants.ENOENT
  empty

# Create the stub application from the templates.
createApplication = ->
  mkdir "#{path}"
  write "#{path}/Cakefile", tmplCakefile
  mkdir "#{path}/bin"
  write "#{path}/bin/#{projectlc}-server", tmplServerLauncher
  mkdir "#{path}/src"
  write "#{path}/src/object.coffee", tmplBaseObject
  mkdir "#{path}/src/client"
  write "#{path}/src/client/index.coffee", tmplClientIndex
  mkdir "#{path}/src/server"
  write "#{path}/src/server/index.coffee", tmplServerIndex
  mkdir "#{path}/src/objects"
  write "#{path}/src/objects/all.coffee", tmplObjectsIndex
  write "#{path}/src/objects/example.coffee", tmplExampleObject
  mkdir "#{path}/public"
  write "#{path}/public/index.html", tmplIndexPage

# Create a directory, if it does not exist.
mkdir = (path) ->
  try
    fs.mkdirSync path, 0777
  catch e
    throw e unless e.errno == constants.EEXIST
  sys.puts "      dir : #{path}"

# Write a file, if it does not exist.
write = (path, str) ->
  try
    fs.statSync path
  catch e
    throw e unless e.errno == constants.ENOENT
    fs.writeFileSync path, str, 'utf-8'
    sys.puts "   create : #{path}"
    return
  sys.puts "   exists : #{path}"

# Ask for confirmation to a question.
confirm = (msg, fn) ->
  prompt msg, (val) ->
    fn(/^ *y(es)?/i.test(val))

# Prompt the user for input.
stdin = null
prompt = (msg, fn) ->
  stdin ||= process.openStdin()
  sys.print msg
  stdin.setEncoding 'ascii'
  stdin.addListener 'data', (data) ->
    fn(data)
    stdin.removeListener 'data', arguments.callee

# Entry-point
if emptyDirectory(path)
  createApplication()
else
  confirm 'destination is not empty, continue? ', (isOkay) ->
    abort 'aborted' unless isOkay
    createApplication()
    stdin.destroy()
