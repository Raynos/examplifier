var classList = require("class-list")
    , marked = require("marked")
    , Fragment = require("fragment")
    , highlight = require("highlight.js")
    , Element = Fragment.Element
    , unpack = require("unpack-element")
    , walk = require("dom-walk")

    , assertionHtml = require("./assertion.html")

    , RENDER_TYPE = {
        COMMENT: 0
        , ASSERTION: 1
        , CODE: 2
        , COMBINATION: 3
    }
    , TEXT_NODE = 3

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
    }
}

function renderCode(chunk) {
    var root = Element(markdown("``` js\n" + chunk.text + "\n```"))

    return {
        root: root
    }
}

function renderCombination(chunk) {
    var container = document.createElement("pre")
        , children = []
        , widget = {
            root: container
            , children: children
        }

    classList(container).add("combination-container")

    chunk.children.forEach(function (chunk) {
        var widget = render(chunk)
            , root = widget.root

        if (root.tagName === "PRE") {
            root = root.firstElementChild
        }

        children.push(widget)
        container.appendChild(root)
    })

    return widget
}

// TODO
function renderAssertion(chunk) {
    var widget = unpack(Element(assertionHtml))

    widget.result.textContent = chunk.text

    return widget
}

function markdown(text) {
    return marked.parse(text, {
        gfm: true
        , pedantic: false
        , sanitized: true
        , highlight: function (code, lang) {
            return highlight.highlight("javascript", code).value
        }
    })
}
