(function() {
  var VERSION, abort, arg, args, confirm, constants, createApplication, emptyDirectory, fs, mkdir, part, path, project, projectlc, prompt, stdin, sys, tmplBaseObject, tmplCakefile, tmplClientIndex, tmplExampleObject, tmplIndexPage, tmplObjectsIndex, tmplServerIndex, tmplServerLauncher, usage, write, _i, _j, _len, _len2, _ref, _results;
  sys = require('sys');
  fs = require('fs');
  constants = process.ENOENT != null ? process : require('constants');
  VERSION = require('../index').VERSION;
  abort = function(msg) {
    sys.error(msg);
    return process.exit(1);
  };
  usage = "Usage: villain [options] PATH [PROJECT]\n\nPROJECT is a name for your project that will be used throughout the\nsource code. You should specify a name in CamelCase.\n\nOptions:\n  -v, --version Output framework version\n  -h, --help    Output help information";
  args = process.argv.slice(2);
  path = null;
  project = null;
  _ref = process.argv.slice(2);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    arg = _ref[_i];
    if (arg === '-h' || arg === '--help') {
      abort(usage);
    }
    if (arg === '-v' || arg === '--version') {
      abort(VERSION);
    }
    if (project) {
      abort(usage);
    } else if (path) {
      project = arg;
    } else {
      path = arg;
    }
  }
  if (!path) {
    abort(usage);
  }
  if (!project) {
    project = path.split('/').pop();
    project = project.split('_');
    project = function() {
      _results = [];
      for (_j = 0, _len2 = project.length; _j < _len2; _j++) {
        part = project[_j];
        _results.push(part.charAt(0).toUpperCase() + part.slice(1));
      }
      return _results;
    }();
    project = project.join('');
  }
  if (!project.match(/^[a-z_\$][a-z0-9_\$]+$/i)) {
    abort("'" + project + "' is not a valid project name.\nThe project name has to be a valid JavaScript variable name.");
  }
  projectlc = project.toLowerCase();
  tmplCakefile = "# A basic Cakefile which compiles CoffeeScript sources for the server,\n# and packages them for the client in a single JavaScript bundle.\n\nvillain = require 'villain/build/cake'\n\n# A task that recreates the `src/` directory structure under `lib/`, and\n# compiles any CoffeeScript in the process.\ntask 'build:modules', 'Compile all " + project + " modules', ->\n  villain.compileDirectory 'src', 'lib'\n\n# A task that takes the modules from `build:modules`, and packages them\n# as a JavaScript bundle for shipping to the browser client.\ntask 'build:client', 'Compile the " + project + " client bundle', ->\n  invoke 'build:modules'\n\n  villain.simpleBundle 'public/" + projectlc + "-bundle.js',\n    '" + projectlc + "/client': './lib/client/index.js'\n\n# The conventional default target.\ntask 'build', 'Compile " + project + "', ->\n  invoke 'build:client'";
  tmplServerLauncher = "#!/usr/bin/env node\n\n// This is the server executable.\n\n// First, find the path to our include directory.\nvar path = require('path');\nvar fs   = require('fs');\nvar lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');\n\n// Then, instantiate and start the server.\nvar " + project + "ServerWorld = require(lib + '/server');\nvar server = new " + project + "ServerWorld();\nserver.start();";
  tmplClientIndex = "ClientWorld = require 'villain/world/net/client'\nobjects = require '../objects/all'\n\n\nclass " + project + "ClientWorld extends ClientWorld\n\nobjects.registerWithWorld " + project + "ClientWorld.prototype\n\n\nclass Client\n\n  constructor: ->\n    @world = new " + project + "ClientWorld()\n\n  start: ->\n\n\nmodule.exports = Client";
  tmplServerIndex = "ServerWorld = require 'villain/world/net/server'\nobjects = require '../objects/all'\n\n\nclass " + project + "ServerWorld extends ServerWorld\n\nobjects.registerWithWorld " + project + "ServerWorld.prototype\n\n\nclass Server\n\n  constructor: ->\n    @world = new " + project + "ServerWorld()\n\n  start: ->\n\n\nmodule.exports = Server";
  tmplBaseObject = "NetWorldObject = require 'villain/world/net/object'\n\n\n# Your base class for all game objects.\nclass " + project + "Object extends NetWorldObject\n\n\nmodule.exports = " + project + "Object";
  tmplExampleObject = "" + project + "Object = require '../object'\n\n\n# An example object, that doesn't really do anything.\nclass Example extends " + project + "Object\n\n  spawn: (arg1, arg2) ->\n\n  update: ->\n\n\nmodule.exports = Example";
  tmplObjectsIndex = "# This is an index of all objects types in the game. It is important for\n# networking that objects are registered in the same order with the\n# `ServerWorld` on the server and the `ClientWorld` on the client.\n# Therefor, you want to use a function like this everywhere.\nexports.registerWithWorld = (w) ->\n  w.registerType require './example'";
  tmplIndexPage = "<!DOCTYPE html>\n<html>\n<head>\n<title>" + project + "</title>\n<script src=\"" + projectlc + "-bundle.js\"></script>\n<script>\n(function(){\n  var " + project + "ClientWorld = require(\"" + projectlc + "/client\");\n  var world = new " + project + "ClientWorld();\n  world.start();\n})();\n</script>\n</head>\n<body>\n</body>\n</html>";
  emptyDirectory = function() {
    var empty;
    empty = true;
    try {
      empty = fs.readdirSync(path).length === 0;
    } catch (e) {
      if (e.errno !== constants.ENOENT) {
        throw e;
      }
    }
    return empty;
  };
  createApplication = function() {
    mkdir("" + path);
    write("" + path + "/Cakefile", tmplCakefile);
    mkdir("" + path + "/bin");
    write("" + path + "/bin/" + projectlc + "-server", tmplServerLauncher);
    mkdir("" + path + "/src");
    write("" + path + "/src/object.coffee", tmplBaseObject);
    mkdir("" + path + "/src/client");
    write("" + path + "/src/client/index.coffee", tmplClientIndex);
    mkdir("" + path + "/src/server");
    write("" + path + "/src/server/index.coffee", tmplServerIndex);
    mkdir("" + path + "/src/objects");
    write("" + path + "/src/objects/all.coffee", tmplObjectsIndex);
    write("" + path + "/src/objects/example.coffee", tmplExampleObject);
    mkdir("" + path + "/public");
    return write("" + path + "/public/index.html", tmplIndexPage);
  };
  mkdir = function(path) {
    try {
      fs.mkdirSync(path, 0777);
    } catch (e) {
      if (e.errno !== constants.EEXIST) {
        throw e;
      }
    }
    return sys.puts("      dir : " + path);
  };
  write = function(path, str) {
    try {
      fs.statSync(path);
    } catch (e) {
      if (e.errno !== constants.ENOENT) {
        throw e;
      }
      fs.writeFileSync(path, str, 'utf-8');
      sys.puts("   create : " + path);
      return;
    }
    return sys.puts("   exists : " + path);
  };
  confirm = function(msg, fn) {
    return prompt(msg, function(val) {
      return fn(/^ *y(es)?/i.test(val));
    });
  };
  stdin = null;
  prompt = function(msg, fn) {
    stdin || (stdin = process.openStdin());
    sys.print(msg);
    stdin.setEncoding('ascii');
    return stdin.addListener('data', function(data) {
      fn(data);
      return stdin.removeListener('data', arguments.callee);
    });
  };
  if (emptyDirectory(path)) {
    createApplication();
  } else {
    confirm('destination is not empty, continue? ', function(isOkay) {
      if (!isOkay) {
        abort('aborted');
      }
      createApplication();
      return stdin.destroy();
    });
  }
}).call(this);
