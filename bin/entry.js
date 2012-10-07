#! /usr/bin/env node

var argv = require("optimist").argv
    // , trycatch = require("trycatch")
    , path = require("path")
    , mkdirp = require("mkdirp")
    , fs = require("fs")
    , rimraf = require("rimraf")
    , asyncMap = require("map-async")
    , Domain = require("domain").create

    , composeAsync = require("../lib/compose-async")
    , bundle = require("../lib/bundle")

    , cwd = process.cwd()
    , output = path.join(cwd, argv.out)
    , input = path.join(cwd, argv._[0])
    , domain = Domain()
    , assets = path.join(__dirname, "..", "assets")

var program = composeAsync(domain
    , function createBundleWithInput(values, callback) {
        var input = values[0]
            , b = bundle()
            , jsonString = JSON.stringify(input.toString())
            , code = "module.exports = { src: " + jsonString + " }"
            , target = "__raw-files__"

        b.files[target] = {
            target: target
            , body: code
        }

        b.addEntry(path.join(assets, "index.js"))

        var text = b.bundle()
        fs.writeFile(path.join(output, "bundle.js"), text, callback)
    }
    , function writeIndexHtml(p, callback) {
        asyncMap([
            "input"
            , "index.html"
            , "readable.css"
            , "assertion.css"
        ], function (value, callback) {
            if (value === "input") {
                return fs.readFile(input, callback)
            }

            fs.createReadStream(path.join(assets, value))
                .pipe(fs.createWriteStream(path.join(output, value)))
                .on("close", callback)
        }, callback)
    }
    , function createOutputDir(callback) {
        mkdirp(output, callback)
    }
    , function cleanOutputDir(callback) {
        rimraf(output, callback)
    }
)

domain.on("error", function (err) {
    //console.log("err", err.stack)
    throw err
})

program(function () {
    console.log("done")
})
