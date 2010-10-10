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
came here to see a 0.1 release.

CoffeeScript is really only a recommendation, not a dependency. There's currently no pure
JavaScript generator, however. If you plan on installing from Git, you *do* need CoffeeScript.

## License

Villain itself is MIT-licensed:

---

© 2010 Stéphan Kochen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

Some files, or parts of files, were taken from other projects:

* `villain/util/events` was only slightly modified from [node.js]'s `events.js`
  (© 2010 Ryan Dahl, MIT-licensed).

* Parts of the `villain/build/cake` are based on [CoffeeScript]'s `command.coffee`
  (© 2010 Jeremy Ashkenas, MIT-licensed) and [Yabble]'s `yabbler.js`
  (© 2010 James Brantly, MIT-licensed).

* The source file `villain/util/brequire` is a modification of [Brequire] (© 2010 Jonah Fox).

 [CoffeeScript]: http://jashkenas.github.com/coffee-script/
 [Orona]: http://github.com/stephank/orona
 [node.js]: http://nodejs.org/
 [npm]: http://github.com/isaacs/npm
 [Yabble]: http://github.com/jbrantly/yabble
 [Brequire]: http://github.com/weepy/brequire
