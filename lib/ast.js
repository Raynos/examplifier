var some = require("some-sync")

module.exports = {
    walk: walk
    , findText: findText
    , getComment: getComment
    , getCommentValue: getCommentValue
}

function walk(node, parent, callback) {
    if (typeof parent === "function") {
        callback = parent
        parent = null
    }

    var result = callback(node, parent)

    if (result) {
        return result
    }

    return some(node, function (child, key) {
        if (key === "parent") {
            return
        }

        if (Array.isArray(child)) {
            var result = some(child, function (child) {
                if (child && typeof child.type === "string") {
                    var result = walk(child, node, callback)

                    if (result) {
                        return result
                    }
                }
            })

            if (result) {
                return result
            }
        } else if (child && typeof child.type === "string") {
            return walk(child, node, callback)
        }
    })
}

function findText(range, comments, source) {
    var bits = [range]

    comments.forEach(function (comment) {
        var start = comment.range[0]
            , end = comment.range[1]

        for (var i = 0; i < bits.length; i++) {
            var bit = bits[i]
                , startRange = bit[0]
                , endRange = bit[1]

            if (startRange < start && endRange > start) {
                bits.splice(i, 1
                    , [startRange, start - comment.loc.start.column]
                    , [end + 1, endRange])
                return
            }
        }
    })

    return bits.map(function (range) {
        return source.substring(range[0], range[1])
    }).join("")
}

function getComment(node, comments) {
    var endLine = node.loc.end.line

    return some(comments, function (comment) {
        var start = comment.loc.start.line

        if (endLine + 1 === start) {
            return comment
        }
    })
}

function getCommentValue(comment) {
    var text = comment.value.trim()
    return new Function("return " + text || "")()
}
