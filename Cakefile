fs = require 'fs'
coffee = require 'coffee-script'

task 'bootstrap', 'Build the Villain circular dependencies.', ->
  fs.mkdirSync(dir, 0777) for dir in ['lib', 'lib/build']
  for module in ['index', 'build/cake']
    modulePath = "src/#{module}.coffee"
    puts "bootstrap : #{modulePath}"
    cscode = fs.readFileSync modulePath, 'utf-8'
    jscode = coffee.compile cscode, fileName: modulePath
    fs.writeFileSync "lib/#{module}.js", jscode, 'utf-8'

task 'build', 'Compile the Villain modules.', ->
  try
    fs.statSync('lib/build/cake.js')
  catch e
    throw e unless e.errno == process.ENOENT
    invoke 'bootstrap'

  villain = require './lib/build/cake'
  villain.compileDirectory 'src', 'lib'
