var classList = require("class-list")
    , marked = require("marked")
    , Fragment = require("fragment")
    , highlight = require("highlight.js")
    , Element = Fragment.Element
    , unpack = require("unpack-element")
    , walk = require("dom-walk")
    , state = require("__raw-files__")
    , extend = require("xtend")
    , EventEmitter = require("events").EventEmitter
    , ace = window.ace

    , assertionHtml = require("./assertion.html")

    , RENDER_TYPE = {
        COMMENT: 0
        , ASSERTION: 1
        , CODE: 2
        , COMBINATION: 3
    }
    , TEXT_NODE = 3

window.require = require

render.RENDER_TYPE = RENDER_TYPE
render[RENDER_TYPE.COMMENT] = renderComment
render[RENDER_TYPE.ASSERTION] = renderAssertion
render[RENDER_TYPE.CODE] = renderCode
render[RENDER_TYPE.COMBINATION] = renderCombination

module.exports = render

function render(chunk) {
    return render[chunk.renderType](chunk)
}

function renderComment(chunk) {
    var root = Fragment(markdown(chunk.text))

    return {
        root: root
        , chunk: chunk
    }
}

function renderCode(chunk) {
    var root = Element(markdown("``` js\n" + chunk.text + "\n```"))

    classList(root).add("code-snippet")

    return {
        root: root
        , chunk: chunk
    }
}

function renderCombination(chunk) {
    var container = document.createElement("pre")
        , children = []
        , widget = extend(new EventEmitter(), {
            root: container
            , chunk: chunk
            , children: children
        })

    classList(container).add("combination-container")
    classList(container).add("code-snippet")

    chunk.children.forEach(function (chunk) {
        var widget = render(chunk)
            , root = widget.root

        if (root.tagName === "PRE") {
            root = root.firstElementChild
        }

        children.push(widget)
        container.appendChild(root)
    })

    container.addEventListener("dblclick", function (ev) {
        //container.style.left = container.offsetLeft + "px"
        //container.style.top = container.offsetTop + "px"
        var div = document.createElement("div")
            , rect = container.getBoundingClientRect()
            , source = state.src.substring(chunk.range[0], chunk.range[1])

        div.textContent = source

        div.style.width = rect.width + "px"
        div.style.height = rect.height + "px"
        div.style.fontSize = "16px"

        container.parentNode.insertBefore(div, container)

        var editor = ace.edit(div)
            , session = editor.getSession()

        editor.setTheme("ace/theme/monokai")
        session.setMode("ace/mode/javascript")

        editor.commands.addCommand({
            name: "save"
            , bindKey: {
                win: "Ctrl-S"
                , mac: "Command-S"
            }
            , exec: handleSave
        })

        function handleSave() {
            var updatedSource = editor.getValue()
            widget.emit("source", updatedSource)
        }
    })

    return widget
}

function renderAssertion(chunk) {
    var widget = unpack(Element(assertionHtml))

    widget.setError = setError
    widget.setCorrect = setCorrect
    widget.chunk = chunk

    return widget

    function setError(value) {
        widget.result.textContent = ""
        widget.error.textContent = "expected " + chunk.text +
            " but got " + JSON.stringify(value)
    }

    function setCorrect(value) {
        widget.error.textContent = ""
        widget.result.textContent = JSON.stringify(value)
    }
}

function markdown(text) {
    return marked.parse(text, {
        gfm: true
        , pedantic: false
        , sanitized: true
        , highlight: function (code, lang) {
            if (lang === "js") {
                return highlight.highlight("javascript", code).value
            }

            return highlight.highlightAuto(code).value
        }
    })
}
