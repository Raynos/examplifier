var toArray = require("to-array")
    , partial = require("ap").partial
    , composeAsync = require("composite").async

module.exports = composeAsyncDomain

function composeAsyncDomain(domain) {
    var args = toArray(arguments, 1)
        .map(function (f) {
            return wrap(domain, f)
        })
        , result = composeAsync.apply(null, args)

    return wrap(domain, result)
}

function wrap(domain, f) {
    return function () {
        var self = this
            , args = toArray(arguments)
            , cb = args[args.length - 1]

        if (typeof cb === "function") {
            args[args.length - 1] = domain.intercept(cb)
        }

        domain.run(function () {
            f.apply(self, args)
        })
    }
}
