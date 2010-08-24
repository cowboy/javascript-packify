# Packify: Something like a JavaScript packer #

Just a little something I'm wasting my time with.

 * this is a work in progress, so YMMV
 * probably only useful for not-too-small, but not-too-big bits of code
 * run it as `packify('code')` in the console
 * code should be pre-minified or closure compiled
 * unnecessary whitespace, semicolons, comments, etc should be removed beforehand
 * code should use `"` wherever possible (avoid `'`, as it needs to be escaped)
 * code should have lots of repeated strings, so reuse vars wherever possible
 * project page, "packifier" web app, lecture tour coming soon


## How it works ##

### Encoding ###

 1. The input source is scanned for repeated strings between 2-20 chars in length, and an array is built. Each array item consists of the string and the number of occurrences. Items that won't save characters are discarded.
 2. The array is sorted based on items that will yield the highest character savings (given the current state of the source).
 3. The first array item, with the highest potential character savings, is shifted off the array.
 4. Replace that item's string in the source with the next unused placeholder char (ASCII 1-31 and 127, excluding 10 and 13).
 5. That ASCII character + the replacement string is appended to the replacement map.
 6. Repeat steps 2-5 until there are no more placeholder ASCII chars or possible replacement strings.

### Decoding ###

 1. For each placeholder char + replacement string combo in the replacement map, replace all matching placeholder chars in the source with the replacement string.
 2. Eval.

## Examples ##

Organ1k, my [JS1k demo](http://js1k.com/demo/450)  
[before](http://benalman.com/code/projects/javascript-packify/examples/organ1k.min.js) (1024b)  
[after](http://benalman.com/code/projects/javascript-packify/examples/organ1k.pck.js) (981b) - [test it out](http://benalman.com/code/projects/javascript-packify/examples/organ1k.html)

Kyle Simpson's [JS1k demo](http://js1k.com/demo/424)  
[before](http://benalman.com/code/projects/javascript-packify/examples/getify.min.js) (1024b)  
[after](http://benalman.com/code/projects/javascript-packify/examples/getify.pck.js) (934b) - [test it out](http://benalman.com/code/projects/javascript-packify/examples/getify.html)

@aivopaas's [JS1k demo](http://js1k.com/demo/197)  
[before](http://benalman.com/code/projects/javascript-packify/examples/aivopaas.min.js) (1314b unpacked, was 1024b using his crusher)  
[after](http://benalman.com/code/projects/javascript-packify/examples/aivopaas.pck.js) (1015b) - [test it out](http://benalman.com/code/projects/javascript-packify/examples/aivopaas.html)


## Credits ##

While this code isn't based on [@aivopaas' Javascript crusher](http://www.iteral.com/jscrush/), which I didn't even know existed until after the fact, it was inspired by the "crushed" source of his [JS1k demo](http://js1k.com/demo/197), which motivated me to try to roll my own version.

Special thanks to [Kyle Simpson](http://github.com/getify) for being the catalyst.


## License ##
Copyright (c) 2010 "Cowboy" Ben Alman  
Dual licensed under the MIT and GPL licenses.  
[http://benalman.com/about/license/](http://benalman.com/about/license/)
