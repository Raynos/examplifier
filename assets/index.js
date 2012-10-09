var state = require("__raw-files__")
    , esprima = require("esprima")
    , forEach = require("for-each")
    , some = require("some-sync")
    , EventEmitter = require("events").EventEmitter
    , deepEqual = require("deep-equal")
    , map = require("map-sync")
    , container = document.getElementById("container")

    , astUtil = require("../lib/ast")
    , render = require("./render")
    , RENDER_TYPE = render.RENDER_TYPE
    , COMBINATION = RENDER_TYPE.COMBINATION
    , CODE = RENDER_TYPE.CODE
    , ASSERTION = RENDER_TYPE.ASSERTION
    , COMMENT = RENDER_TYPE.COMMENT

if (window.location.host === "localhost:8080") {
    require("live-reload")(9090)
}

var assertions = state.assertions = new EventEmitter

handleSource(state.src)

function handleSource(source) {
    var ast = window.ast = esprima.parse(source, {
            loc: true
            , comment: true
            , range: true
        })
        , comments = ast.comments

    comments.forEach(function (comment) {
        comment.renderType = COMMENT
        comment.text = comment.value
    })

    var body = map(ast.body, function (item) {
        if (!item.range) {
            return {}
        }

        item.text = astUtil.findText(item.range, comments, source)
        item.renderType = CODE

        return {
            type: "CombinationNode"
            , children: [item]
            , loc: item.loc
            , range: item.range
            , renderType: COMBINATION
        }
    })

    console.log('body', body)

    astUtil.walk({ body: body }, function (node, parent) {
        if (node.type !== "CallExpression") {
            return
        }

        if (node.callee.name !== "log") {
            return
        }

        var name = node.arguments[0].value
            , comment = astUtil.getComment(node, comments)

        if (comment) {
            var value = astUtil.getCommentValue(comment)
            comment.renderType = ASSERTION
            comment.assertionValue = value
            comment.assertionName = name
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
                    if (current.range[1] > last.range[1]) {
                        last.range[1] = current.range[1]
                    }
                } else {
                    list.pop()
                    var greater = last.range[1]
                    if (current.range[1] > greater) {
                        greater = current.range[1]
                    }

                    list.push({
                        type: "CombinationNode"
                        , children: [last, current]
                        , loc: {
                            start: last.loc.start
                            , end: current.loc.end
                        }
                        , range: [last.range[0], greater]
                        , renderType: COMBINATION
                    })
                }
            } else {
                list.push(current)
            }

            return list
        }, [])

    var components = chunks.map(function (chunk) {
        var widget = render(chunk)

        if (chunk.renderType === COMBINATION) {
            widget.on("source", function (changes) {
                var range = chunk.range
                    , before = source.substring(0, range[0])
                    , after = source.substring(range[1])

                var newSource = before + changes + after

                state.src = newSource

                require.define(state.uri
                    , Function([
                        "require"
                        , "module"
                        , "exports"
                        , "__dirname"
                        , "__filename"
                        , "process"
                        , "global"
                    ], newSource + "\n//@ sourceURL=" + state.uri))

                container.textContent = ""
                assertions.removeListener("assert", handleAssert)
                handleSource(newSource)
            })
        }

        if (widget && widget.root) {
            container.appendChild(widget.root)
        } else {
            console.log("chunk", chunk, "widget", widget
                , "render", render)
        }

        return widget
    })

    assertions.on("assert", handleAssert)

    function handleAssert(assert) {
        var line = assert.line
            , name = assert.name
            , value = assert.value
            , component = some(components, findComponent)

        // Should never happen?
        if (!component) {
            console.log("no component", assert)
            return
        }

        var expected = component.chunk.assertionValue

        if (!(isLiteral(value) && expected === value) ||
            !deepEqual(expected, value)
        ) {
            component.setError(value)
        } else {
            component.setCorrect(value)
        }

        function findComponent(component, key) {
            var chunk = component.chunk

            if (chunk.renderType === ASSERTION &&
                (chunk.loc.start.line === line ||
                chunk.assertionName === name)
            ) {
                return component
            } else if (chunk.renderType === COMBINATION) {
                return some(component.children, findComponent)
            }
        }

        function isLiteral(value) {
            return typeof value === "number" ||
                typeof value === "string" ||
                typeof value === "boolean" ||
                value === undefined ||
                value === null
        }
    }

    require.modules[state.uri]()
}

function isValidCombination(last, current) {
    var lastType = last.renderType
        , currentType = current.renderType

    return (lastType === COMBINATION || lastType === CODE) &&
        (currentType === CODE || currentType === ASSERTION)
}
