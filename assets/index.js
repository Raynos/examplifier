var state = require("__raw-files__")
    , source = state.src
    , esprima = require("esprima")
    , forEach = require("for-each")
    , some = require("some-sync")
    , EventEmitter = require("events").EventEmitter
    , deepEqual = require("deep-equal")

    , astUtil = require("../lib/ast")
    , render = require("./render")
    , RENDER_TYPE = render.RENDER_TYPE
    , COMBINATION = RENDER_TYPE.COMBINATION
    , CODE = RENDER_TYPE.CODE
    , ASSERTION = RENDER_TYPE.ASSERTION
    , COMMENT = RENDER_TYPE.COMMENT

    , ast = window.ast = esprima.parse(source, {
        loc: true
        , comment: true
        , range: true
    })
    , comments = ast.comments
    , assertions = state.assertions = new EventEmitter

comments.forEach(function (comment) {
    comment.renderType = COMMENT
    comment.text = comment.value
})

forEach(ast.body, function (item) {
    if (!item.range) {
        return
    }

    item.text = astUtil.findText(item.range, comments, source)
    item.renderType = CODE
})

astUtil.walk({ body: ast.body }, function (node, parent) {
    if (node.type !== "CallExpression") {
        return
    }

    if (node.callee.name !== "log") {
        return
    }

    var text = node.arguments[0].value
        , comment = astUtil.getComment(node, comments)

    if (comment) {
        var value = astUtil.getCommentValue(comment)
        comment.renderType = ASSERTION
        comment.assertionValue = value
        comment.assertionText = text
    }
})

var chunks = ast.body.concat(comments)
    .sort(function (a, b) {
        return a.range[0] < b.range[0] ? -1 : 1
    })
    .reduce(function (list, current) {
        var last = list[list.length - 1]

        list = list.slice()

        if (last && isValidCombination(last, current)) {
            if (last.renderType === COMBINATION) {
                last.children.push(current)
                last.loc.end = current.loc.end
                last.range[1] = current.range[1]
            } else {
                list.pop()
                list.push({
                    type: "CombinationNode"
                    , children: [last, current]
                    , loc: {
                        start: last.loc.start
                        , end: current.loc.end
                    }
                    , range: [last.range[0], current.range[1]]
                    , renderType: COMBINATION
                })
            }
        } else {
            list.push(current)
        }

        return list
    }, [])

function isValidCombination(last, current) {
    var lastType = last.renderType
        , currentType = current.renderType

    return (lastType === COMBINATION || lastType === CODE) &&
        (currentType === CODE || currentType === ASSERTION)
}

var components = chunks.map(function (chunk) {
    var widget = render(chunk)

    if (widget && widget.root) {
        document.body.appendChild(widget.root)
    } else {
        console.log("chunk", chunk, "widget", widget
            , "render", render)
    }

    return widget
})

assertions.on("assert", function (assert) {
    var name = assert.name
        , value = assert.value
        , component = some(components, findComponent)

    // Should never happen?
    if (!component) {
        console.log("no component", assert)
        return
    }

    var expected = component.chunk.assertionValue

    if (deepEqual(expected, value)) {
        component.setCorrect(value)
    } else {
        component.setError(value)
    }

    function findComponent(component, key) {
        var chunk = component.chunk

        if (chunk.renderType === ASSERTION &&
            chunk.assertionText === name
        ) {
            return component
        } else if (chunk.renderType === COMBINATION) {
            return some(component.children, findComponent)
        }
    }
})

require("__require-files__")
