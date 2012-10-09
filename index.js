var assertions = require("__raw-files__").assertions
    , stacktrace = require("stacktrace-js")

module.exports = log

function log(value) {
    var stack = stacktrace()
        , line = stack[4].split(":")[1]

    assertions.emit("assert", {
        value: value
        , line: +line
    })
}
