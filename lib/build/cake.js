(function() {
  var bundleSources, coffee, compileDirectory, constants, createCompressorStream, determineDependencies, fs, iterateDependencyTree, path, simpleBundle, spawn, sys, villain, wrapModule;
  var __hasProp = Object.prototype.hasOwnProperty;
  fs = require('fs');
  path = require('path');
  constants = process.ENOENT != null ? process : require('constants');
  spawn = require('child_process').spawn;
  coffee = require('coffee-script');
  villain = require('../index');
  sys = require('sys');
  compileDirectory = function(indir, outdir) {
    var cscode, filename, inpath, jscode, outpath, stats, _i, _len, _ref, _results;
    try {
      fs.mkdirSync(outdir, 0777);
    } catch (e) {

    }
    _ref = fs.readdirSync(indir);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      filename = _ref[_i];
      inpath = path.join(indir, filename);
      outpath = path.join(outdir, filename);
      _results.push(filename.match(/\.coffee$/) ? (sys.puts("   coffee : " + inpath), outpath = outpath.replace(/\.coffee$/, '.js'), cscode = fs.readFileSync(inpath, 'utf-8'), jscode = coffee.compile(cscode, {
        fileName: inpath
      }), fs.writeFileSync(outpath, jscode, 'utf-8')) : filename.match(/\.js$/) ? (sys.puts("       js : " + inpath), jscode = fs.readFileSync(inpath, 'utf-8'), fs.writeFileSync(outpath, jscode, 'utf-8')) : (stats = fs.statSync(inpath), stats.isDirectory() ? compileDirectory(inpath, outpath) : void 0));
    }
    return _results;
  };
  determineDependencies = function(module, filename, code, env) {
    var fileParts, first, match, moduleParts, part, re, requireParts, requirepath, retval, _i, _len;
    env || (env = {});
    retval = [];
    re = /(?:^|[^\w\$_.])require\s*\(\s*("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')\s*\)/g;
    while (match = re.exec(code)) {
      requirepath = eval(match[1]);
      requireParts = eval(match[1]).split('/');
      if (requirepath.charAt(0) !== '.') {
        first = requireParts.shift();
        if (!env.hasOwnProperty(first)) {
          continue;
        }
        fileParts = env[first].split('/');
        moduleParts = [first];
      } else {
        fileParts = filename.split('/');
        fileParts.pop();
        moduleParts = module.split('/');
        moduleParts.pop();
      }
      for (_i = 0, _len = requireParts.length; _i < _len; _i++) {
        part = requireParts[_i];
        switch (part) {
          case '.':
            continue;
            break;
          case '..':
            moduleParts.pop();
            fileParts.pop();
            break;
          default:
            moduleParts.push(part);
            fileParts.push(part);
        }
      }
      retval.push([moduleParts.join('/'), fileParts.join('/')]);
    }
    return retval;
  };
  wrapModule = function(module, code) {
    return "require.module('" + module + "', function(module, exports, require) {\n" + code + "\n});\n";
  };
  iterateDependencyTree = function(module, filename, state, cb) {
    var code, file, mod, _i, _len, _ref, _ref2;
    try {
      if (fs.statSync(filename).isDirectory()) {
        filename = path.join(filename, 'index.js');
      }
    } catch (e) {
      if (e.errno !== constants.ENOENT) {
        throw e;
      }
    }
    if (!filename.match(/\.js$/)) {
      filename = "" + filename + ".js";
    }
    if (filename.match(/\/index\.js$/) && !module.match(/\/index$/)) {
      module = path.join(module, 'index');
    }
    if (state.seen.indexOf(module) !== -1) {
      return;
    }
    state.seen.push(module);
    code = fs.readFileSync(filename, 'utf-8');
    cb(module, filename, code);
    _ref = determineDependencies(module, filename, code, state.env);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], mod = _ref2[0], file = _ref2[1];
      iterateDependencyTree(mod, file, state, cb);
    }
    return;
  };
  bundleSources = function(output, options) {
    var additional, code, env, filename, modules, state, _fn, _i, _len;
    modules = options.modules || {};
    env = options.env || {};
    additional = options.additional || [];
    for (_i = 0, _len = additional.length; _i < _len; _i++) {
      filename = additional[_i];
      sys.puts("   bundle : " + filename);
      code = fs.readFileSync(filename, 'utf-8');
      output.write(code);
    }
    state = {};
    state.env = options.env || {};
    state.seen = [];
    _fn = function(module, filename) {
      return iterateDependencyTree(module, filename, state, function(mod, file, code) {
        var wrapped;
        sys.puts("   bundle : " + file);
        wrapped = wrapModule(mod, code);
        return output.write(wrapped);
      });
    };
    for (module in modules) {
      if (!__hasProp.call(modules, module)) continue;
      filename = modules[module];
      _fn(module, filename);
    }
    return;
  };
  createCompressorStream = function(wrappee) {
    var closure, name, realEnd, sub, uglifyjs;
    sub = null;
    if (closure = process.env.CLOSURE) {
      sub = spawn('java', ['-jar', closure]);
      name = 'UglifyJS';
    } else if (uglifyjs = process.env.UGLIFYJS) {
      sub = spawn('node', [uglifyjs]);
      name = 'Closure';
    }
    if (sub) {
      realEnd = sub.end;
      sub.end = function() {
        sys.puts("  compress : " + name);
        return realEnd.apply(sub, arguments);
      };
      sub.stdout.on('data', function(buffer) {
        return wrappee.write(buffer);
      });
      sub.stderr.on('data', function(buffer) {
        return process.stdout.write(buffer);
      });
      sub.on('exit', function() {
        return wrappee.end();
      });
      return sub.stdin;
    } else {
      return wrappee;
    }
  };
  simpleBundle = function(bundlepath, modules) {
    var output, villainLib;
    output = createCompressorStream(fs.createWriteStream(bundlepath));
    villainLib = villain.getLibraryPath();
    bundleSources(output, {
      env: {
        'villain': villainLib,
        'events': path.join(villainLib, 'util', 'events.js')
      },
      modules: modules,
      additional: [path.join(villainLib, 'util', 'brequire.js')]
    });
    return output.end();
  };
  exports.compileDirectory = compileDirectory;
  exports.determineDependencies = determineDependencies;
  exports.wrapModule = wrapModule;
  exports.bundleSources = bundleSources;
  exports.createCompressorStream = createCompressorStream;
  exports.simpleBundle = simpleBundle;
}).call(this);
