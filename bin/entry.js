#! /usr/bin/env node

var argv = require("optimist").argv
    // , trycatch = require("trycatch")
    , path = require("path")
    , mkdirp = require("mkdirp")
    , fs = require("fs")
    , rimraf = require("rimraf")
    , Domain = require("domain").create

    , composeAsync = require("../lib/compose-async")
    , bundle = require("../lib/bundle")

    , cwd = process.cwd()
    , output = path.join(cwd, argv.out)
    , input = path.join(cwd, argv._[0])
    , domain = Domain()
    , assets = path.join(__dirname, "..", "assets")

var program = composeAsync(domain
    , function createBundleWithInput(input, callback) {
        var b = bundle()
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
    , function getInputFile(callback) {
        fs.readFile(input, callback)
    }
    , function writeCss(callback) {
        fs.createReadStream(path.join(assets, "readable.css"))
            .pipe(fs.createWriteStream(path.join(output, "readable.css")))
            .on("close", callback)
    }
    , function writeIndexHtml(p, callback) {
        var inputPath = path.join(assets, "index.html")
            , outputPath = path.join(output, "index.html")

        fs.createReadStream(inputPath)
            .pipe(fs.createWriteStream(outputPath))
            .on("close", callback)
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
