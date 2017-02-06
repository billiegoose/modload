'use strict'
let path = require('path')
let Module = require('module')
// Remove the modrun.js argument, so the actual main module isn't confused when it parses argv.
process.argv.splice(1, 1)

// Now we need to modify the semantics of 'require'
let requireHacker = require('require-hacker')
// requireHacker.global_hook('logger', (request, parent) => {
//   console.log('You asked for ' + request)
//   return
// })
requireHacker.resolver((request, parent) => {
  console.log('You asked for ' + request)
  if (request === 'foobar') {
    return path.resolve(__dirname, '../package.json')
  }
  return
})
// 
// // Notes:
// // Module.prototype.require is only three lines of code. Plus tricky to alter permanently.
// // The better place to tinker is Module._load. It has the perfect function signature for
// // total control: (requiredPath, parentModule, isMain) -> module.exports
// 
// const __cache = {}
// 
// Module._cache = new Proxy(__cache, {
//   set (target, property, value, receiver) {
//     console.log('You adding to my __cache: ' + property)
//     target[property] = value
//     return true
//   },
//   get (target, property, receiver) {
//     console.log('You retrieving from my __cache: ' + property)
//     return target[property]
//   }
// })
// 
// const __load = Module._load
// Module._load = function _load (...args) {
//   let [request, parent, isMain] = args
//   console.log('You asked for ' + request)
//   let res = __load(...args)
//   console.log('You got exports ' + JSON.stringify(res))
//   return res
// }
// 
// // Fuck everyone else. Mwahahaha.
// Object.freeze(Module)

// require = require('really-need')
// let mymodule = require(process.argv[1], {
//   fake: `console.log("You tried to run ${process.argv[1]}"); module.exports = {};`,
//   parent: undefined
// })
// console.log(mymodule)
// Finally, we need to convince this module he's the main module.
// Unfortunately, this is not part of the documented API.
// https://github.com/nodejs/node/blob/master/lib/module.js#L602
Module.runMain(process.argv[1])
