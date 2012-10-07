var Signal = require("ready-signal")
    , log = require("../index")

/*

Signal gives you a signal function.

*/
log("1", typeof Signal)
// "function"

/*

You can attach a listener to signal and it will be called

*/

var r1 = Signal()
r1(function callback () {
    log("2", true)
    // true
})

r1()

/*

It also calls your listener if you add it after the signal is ready

*/

var r2 = Signal()

r2()

r2(function callback() {
    log("3", true)
    // true
})

/*

Multiple callbacks will also fire!

*/

var r3 = Signal()

r3(function callback() {
    log("4", true)
    // true
})

r3()

r3(function callback() {
    log("5", true)
    // true
})
