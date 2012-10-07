var browserify = require("browserify")
    , path = require("path")

module.exports = bundle

function handleHtml(file, fileName) {
    return "module.exports = '" + file.replace(/\n/g, "\\n") + "'"
}

function bundle() {
    var b = browserify({
            debug: true
        })

    b.on("syntaxError", function (err) {
        b.emit("error", err)
    })

    b.register(".html", handleHtml)
    b.register(".svg", handleHtml)

    return b
}
