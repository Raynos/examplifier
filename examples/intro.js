/*

# Doc-test-client (In need of a better name!)

A tool for generating HTML live examples from soure code.

## The overview

 - takes a javascript file
 - generates a HTML page.
 - Turns markdown in comments into HTML
 - Prints little assertions based on `log` calls

The main purpose of this tool is to enable literate programming
with live feedback. Your write a program with comments and it's
turned into a document with introspection tools embedded in it.

## Installation and usage

This file is generated from [a simple javascript file][1]

To compile a file like that to run with doc-test-client just

```
$ npm install doc-test-client
$ doc-test-client --out=./path/to/out/dir ./path/to/file
```

Then go into the output folder and open the index.html

  [1]: https://github.com/Raynos/doc-test-client/tree/master/examples/intro.js
*/

/*

## The pretty markdown

`doc-test-client` generates a nice index.html file that
creates a HTML document that looks like markdown but is based
on the source code.

*/

/*

## The `log` function

doc-test gives you a log function.

(Since this file your looking at is executable we have to require
it locally using `"../index"` instead of `"doc-test-client"`)

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

  [1]: https://github.com/Raynos/doc-test-client/tree/master/examples/intro.js
*/

log("2", 4 + 6)
// 11


/*

### `log(key, value)`

Call `log` with a unique key so that pre-processor can identify
the correct comment and then match it up to the log invocation
at run-time.

The second `value` parameter is what ever value you want to check
againsts the expected value that is commented below the `log`
call.

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

That's all really.

Just document your examples however you want. Include snippets with
little assertions and let your users see that your program actually
does what you claim it does by running the program.

*/
