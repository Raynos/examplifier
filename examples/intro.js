/*

# Examplifier

Turn bland source code into interactive demos

## The overview

 - takes a javascript file
 - generates interactive demos
     - Turns embedded markdown in comments into HTML
     - Clever result printing with `log`
     - All code snippets are live editable.

The main purpose of this tool is to enable literate programming
with live feedback. Your write a program with comments and it's
turned into a document with introspection tools embedded in it.

## Installation and usage

This file is generated from [a simple javascript file][1]

To compile a file like that to run with doc-test-client just

```
$ npm install examplifier
$ examplifier --out=./path/to/out/dir ./path/to/file
```

Then go into the output folder and open the index.html

  [1]: https://github.com/Raynos/examplifier/tree/master/examples/intro.js
*/

/*

## The pretty markdown

`examplifier` generates a nice index.html file that
creates a HTML document that looks like markdown but is based
on the source code.

*/

/*

## The `log` function

examplifier gives you a log function.

(Requiring ../index instead of examplifier as this is a local example)
*/

var log = require("../index")

log("1", typeof log)
// "function"

/*

What's actually happening is that the [source file][1]
is being executed and we are comparing `typeof log` with the value
`"function"`. These are obvouisly the same so it's printed in green.

If we were to make a comparison that is wrong it would print an error
message in red

  [1]: https://github.com/Raynos/examplifier/tree/master/examples/intro.js
*/

log("2", 4 + 6)
// 11

/*

# Live Editing

Red sucks! We should fix that.

**Double click** the code above and edit the statement to log 11 instead.
Then hit **Ctrl+S (or Cmd+S)** to save the changes

*/

/*

### `log(key, value)`

Call `log` with a unique key so that pre-processor can identify
the correct comment and then match it up to the log invocation
at run-time.

The second `value` parameter is what ever value you want to check
againsts the expected value that is commented below the `log`
call.

You can also call `log(value)` and it will guess the comment location
using stack trace magickery. This is only known to work in chrome.

Example:

``` js
log("uid", 20)
// 22

log("uid2", typeof "foo")
// "string"
```

*/

log("uid", 20)
// 22

log("uid2", typeof "foo")
// "string"

/*

Another red error. Edit and fix it!

Asynchronous logging works as well

*/

setTimeout(function () {
    log("3", "totally works")
    // "totally works"
}, 10000)

/*

That's all really.

Just document your examples however you want. Include snippets with
little assertions and let your users see that your program actually
does what you claim it does by running the program.

*/
