var marked = require("marked")
    , Fragment = require("fragment")
    , highlight = require("highlight.js")

module.exports = markdown

function markdown(text) {
    return Fragment(marked.parse(text, {
        gfm: true
        , pedantic: false
        , sanitized: true
        , highlight: function (code, lang) {
            return highlight.highlight("javascript", code).value
        }
    }))
}
