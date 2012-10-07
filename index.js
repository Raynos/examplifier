var assertions = require("__raw-files__").assertions

module.exports = log

function log(name, value) {
    assertions.emit("assert", {
        name: name
        , value: value
    })
}
