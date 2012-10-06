#! /usr/bin/env node

var argv = require("optimist").argv
    , trycatch = require("trycatch")
    , path = require("path")
    , mkdirp = require("mkdirp")
    , fs = require("fs")
    , toArray = require("to-array")
    , rimraf = require("rimraf")
    , composeAsync = require("composite").async
    , Domain = require("domain").create

    , cwd = process.cwd()
    , output = path.join(cwd, argv.out)
    , input = path.join(cwd, argv._[0])
    , domain = Domain()

var program = composeAsyncWithThrown(
    function (p, callback) {
        var inputPath = path.join(__dirname, "..", "assets", "index.html")
            , outputPath = path.join(output, "index.html")

        fs.createReadStream(inputPath)
            .pipe(fs.createWriteStream(outputPath))
            .on("close", callback)
    }
    , function (callback) {
        mkdirp(this.output, callback)
    }
    , function (callback) {
        rimraf(this.output, callback)
    }
)

domain.on("error", function (err) {
    //console.log("err", err.stack)
    throw err
})

program.call({
    output: output
}, function () {
    console.log("done")
})

function composeAsyncWithThrown() {
    var args = toArray(arguments)
        .map(function (f) {
            return function () {
                var args = toArray(arguments)
                    , cb = args[args.length - 1]

                if (typeof cb === "function") {
                    args[args.length - 1] = domain.intercept(cb)
                }

                return f.apply(this, args)
            }
        })

    return composeAsync.apply(null, args)
}
