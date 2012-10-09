var assertions = require("__raw-files__").assertions
    , stacktrace = require("stacktrace-js")

module.exports = log

function log(name, value) {
    var stack = stacktrace()
        , line = stack[4].split(":")[1]

    if (arguments.length === 1) {
        value = name
        name = null
    }

    assertions.emit("assert", {
        value: value
        , name: name
        , line: +line
    })
}
