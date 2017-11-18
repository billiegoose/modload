#!/usr/bin/env node
let Module = require('module')
const upath = require('upath')
const sortKeys = require('sort-keys')
const fs = require('fs')
// Remove the modrun.js argument, so the actual main module isn't confused when it parses argv.
process.argv.splice(1, 1)

// See if we have an existing cache.
let tree = {}
if (fs.existsSync('node_modules.cache.json')) {
  tree = JSON.parse(fs.readFileSync('node_modules.cache.json', 'utf8'))
  console.log('>>> Loaded node_modules.cache.json <<<')
}

// For easier reading of output, lets shave some path info.
let rootDir = upath.dirname(upath.resolve(process.argv[1]))

// Now we need to modify the semantics of 'require'
let requireHacker = require('require-hacker')
requireHacker.global_hook('logger', (path, module) => {
  const start = upath.normalizeTrim(upath.joinSafe('./', upath.relative(rootDir, module && module.id && module.id.replace(/\.logger$/, '') || '')))
  const result = (tree[start] && tree[start][path]) || upath.normalizeTrim(upath.joinSafe('./', upath.relative(rootDir, requireHacker.resolve(path, module))))
  // add to graph
  tree[start] = tree[start] || {}
  // if (tree[start][path]) {
  //   if (tree[start][path] !== result) {
  //     console.log('ASSERTION FAILURE:')
  //     console.log('expected:')
  //     console.log([start, path, tree[start][path]])
  //     console.log('saw:')
  //     console.log(triplet)
  //     process.exit(1)
  //   }
  // }
  tree[start][path] = result
  // Emulate the original behavior.
  let source = fs.readFileSync(upath.join(rootDir, result), 'utf8')
  // Handle stupid JSON case.
  if (upath.extname(result) === '.json') source = 'module.exports = ' + source
  let foo = {
    source,
    path: upath.join(rootDir, result)
  }
  return foo
})

process.on('exit', function () {
  let cache = JSON.stringify(sortKeys(tree, {deep: true}), null, 2)
  fs.writeFileSync('node_modules.cache.json', cache, 'utf8')
})
// Finally, we need to convince this module he's the main module.
// Unfortunately, this is not part of the documented API.
// https://github.com/nodejs/node/blob/master/lib/module.js#L602
Module.runMain(process.argv[1])

// requireHacker.resolver((request, parent) => {
//   console.log('You asked for ' + request)
//   if (request === 'foobar') {
//     return path.resolve(__dirname, '../package.json')
//   }
//   return
// })
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

