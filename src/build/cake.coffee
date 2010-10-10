# This module contains helpers for Cakefiles of villain projects. Villain itself uses it too.

fs      = require 'fs'
path    = require 'path'
{spawn} = require 'child_process'
coffee  = require 'coffee-script'
villain = require '../index'

# FIXME: watch functionality, as in 'coffee -w ...'


# Recursively compile coffee files in `indir`, place them in `outdir`.
compileDirectory = (indir, outdir) ->
  try
    fs.mkdirSync outdir, 0777
  catch e # Assume already exists.

  for filename in fs.readdirSync(indir)
    inpath = path.join indir, filename
    outpath = path.join outdir, filename
    if filename.match /\.coffee$/
      puts "   coffee : #{inpath}"
      outpath = outpath.replace /\.coffee$/, '.js'
      cscode = fs.readFileSync inpath, 'utf-8'
      jscode = coffee.compile cscode, fileName: inpath
      fs.writeFileSync outpath, jscode, 'utf-8'
    else if filename.match /\.js$/
      puts "       js : #{inpath}"
      jscode = fs.readFileSync inpath, 'utf-8'
      fs.writeFileSync outpath, jscode, 'utf-8'
    else
      stats = fs.statSync inpath
      compileDirectory(inpath, outpath) if stats.isDirectory()

# Return an array of the dependencies of a given module. The array contains pairs of the module
# names and file names. The optional `env` is a hash mapping external libraries to their base
# include path. Only relative dependencies and dependencies from `env` are included in the results.
determineDependencies = (module, filename, code, env) ->
  env ||= {}
  retval = []

  re = /(?:^|[^\w\$_.])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g
  while match = re.exec(code)
    requirepath = eval(match[1])
    requireParts = eval(match[1]).split('/')

    if requirepath.charAt(0) != '.'
      first = requireParts.shift()
      continue unless env.hasOwnProperty(first)
      fileParts = env[first].split('/')
      moduleParts = [first]
    else
      fileParts = filename.split('/'); fileParts.pop()
      moduleParts = module.split('/'); moduleParts.pop()

    for part in requireParts
      switch part
        when '.'  then continue
        when '..' then moduleParts.pop();      fileParts.pop()
        else           moduleParts.push(part); fileParts.push(part)

    retval.push [moduleParts.join('/'), fileParts.join('/')]

  retval

# Wrap some JavaScript into a module transport definition.
wrapModule = (module, code) ->
  """
    require.module('#{module}', function(module, exports, require) {
    #{code}
    });

  """

# Iterate on the given module and its dependencies. This is an internal helper for `bundleSources`.
iterateDependencyTree = (module, filename, state, cb) ->
  try
    if fs.statSync(filename).isDirectory()
      filename = path.join filename, 'index.js'
  catch e
    throw e unless e.errno == process.ENOENT
  unless filename.match(/\.js$/)
    filename = "#{filename}.js"
  if filename.match(/\/index\.js$/) and not module.match(/\/index$/)
    module = path.join module, 'index'
  return if state.seen.indexOf(module) != -1
  state.seen.push module

  code = fs.readFileSync filename, 'utf-8'
  cb(module, filename, code)

  for [mod, file] in determineDependencies(module, filename, code, state.env)
    iterateDependencyTree(mod, file, state, cb)
  return

# Create a bundle of sources, and write it to the stream `output`. The options contains:
#
# * `modules`: The base modules to compile. This is a mapping of module names to their source
#   files. All of these files will be inspected for dependencies and bundled.
# * `additional`: Additional files to include verbatim. Unlike `modules`, these files are not
#   wrapped in a transport definition, and are included at the top of the bundle.
# * `env`: A mapping of names of external libraries to their include paths. Normally, absolute
#   requires are skipped. Requires for libraries in `env` are the exception, and will be included
#   in the bundle, along with their dependencies.
bundleSources = (output, options) ->
  modules    = options.modules || {}
  env        = options.env || {}
  additional = options.additional || []

  for filename in additional
    puts "   bundle : #{filename}"
    code = fs.readFileSync filename, 'utf-8'
    output.write code

  state = {}
  state.env = options.env || {}
  state.seen = []

  for module, filename of modules
    iterateDependencyTree module, filename, state, (mod, file, code) ->
      puts "   bundle : #{file}"
      wrapped = wrapModule mod, code
      output.write wrapped

  return

# Wraps a writable stream with a JavaScript compressor. The compressor is activated by the user
# using environment variables `CLOSURE` or `UGLIFYJS`.
createCompressorStream = (wrappee) ->
  sub = null
  if closure = process.env.CLOSURE
    sub = spawn 'java', ['-jar', closure]
    name = 'UglifyJS'
  else if uglifyjs = process.env.UGLIFYJS
    sub = spawn 'node', [uglifyjs]
    name = 'Closure'

  if sub
    realEnd = sub.end
    sub.end = ->
      puts "  compress : #{name}"
      realEnd.apply sub, arguments

    sub.stdout.on 'data', (buffer) -> wrappee.write buffer
    sub.stderr.on 'data', (buffer) -> process.stdout.write buffer
    sub.on 'exit', -> wrappee.end()
    sub.stdin
  else
    wrappee

# The helper used to build the client bundle in a basic Villain project set-up. It includes the
# browser-side CommonJS and EventEmitter libraries, bundles required Villain sources, and applies
# a compressor if one was specified.
simpleBundle = (bundlepath, modules) ->
  output = createCompressorStream fs.createWriteStream bundlepath
  villainLib = villain.getLibraryPath()
  bundleSources output,
    env:
      'villain': villainLib
      'events': path.join(villainLib, 'util', 'events.js')
    modules: modules
    additional: [
        path.join(villainLib, 'util', 'brequire.js')
      ]
  output.end()


## Exports

exports.compileDirectory = compileDirectory
exports.determineDependencies = determineDependencies
exports.wrapModule = wrapModule
exports.bundleSources = bundleSources
exports.createCompressorStream = createCompressorStream
exports.simpleBundle = simpleBundle
