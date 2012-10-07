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
        var inputValue = values[0]
            , b = bundle()
            , jsonString = JSON.stringify(inputValue.toString())
            , stateCode =
                "module.exports = { \n" +
                    "src: " + jsonString + "\n" +
                "}"
            , stateTarget = "__raw-files__"
            , requireCode = "require(" + JSON.stringify(argv._[0]) + ")\n"
            , requireTarget = "__require-files__"

        b.files[stateTarget] = {
            target: stateTarget
            , body: stateCode
        }

        b.files[requireTarget] = {
            target: requireTarget
            , body: requireCode
        }

        b.require(input)
        b.addEntry(path.join(assets, "index.js"))

        var text = b.bundle()
        fs.writeFile(path.join(output, "bundle.js"), text, callback)
    }
    , function writeIndexHtml(p, callback) {
        asyncMap([
            "input"
            , "index.html"
            , "style.css"
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
