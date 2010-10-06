# Villain

Villain is library / framework for real-time game development in JavaScript and [CoffeeScript].
Currently, villain consists of a set of base classes for real-time games, a set of subclasses that
implement networking, and build tools to enable code-sharing between server and browser.

Villain was extracted from [Orona].

## Usage

You need [node.js] and [npm]. Then, simply:

    npm install villain coffee-script
    villain path/to/project/directory ProjectName

Documentation is scarce, and the generator currently builds a very rough template. But then, you
came here to see a 0.1.0 release.

CoffeeScript is really only a recommendation, not a dependency. There's currently no pure
JavaScript generator, however. If you plan on installing from Git, you *do* need CoffeeScript.

## License

Villain itself is MIT-licensed. See `LICENSE` for the details.

Some files, or parts of files, were taken from other projects.

`villain/util/events` was only slightly modified from:

 * [node.js] `events.js`, © 2010 Ryan Dahl, MIT-licensed.

Parts of the `villain/build/cake` are based on:

 * [CoffeeScript] `command.coffee`, © 2010 Jeremy Ashkenas, MIT-licensed.
 * [Yabble] `yabbler.js`, © 2010 James Brantly, MIT-licensed.

The source file `villain/util/brequire` is a modification based on:

 * [Brequire], © 2010 Jonah Fox.

 [CoffeeScript]: http://jashkenas.github.com/coffee-script/
 [Orona]: http://github.com/stephank/orona
 [node.js]: http://nodejs.org/
 [npm]: http://github.com/isaacs/npm
 [Yabble]: http://github.com/jbrantly/yabble
 [Brequire]: http://github.com/weepy/brequire
