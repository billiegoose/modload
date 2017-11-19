#!/usr/bin/env node
let Module = require('module')
const fs = require('fs')
const upath = require('upath')
const syspath = require('path')
const sortKeys = require('sort-keys')
const shasum = require('shasum')
const util = require('util')
const fileQueue = []
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
// Remove the modrun.js argument, so the actual main module isn't confused when it parses argv.
process.argv.splice(1, 1)

// For easier reading of output, lets shave some path info.
let rootDir = upath.dirname(upath.resolve(process.argv[1]))

// See if we have an existing cache.
const cacheDir = upath.join(rootDir, 'node_modules.cache')
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir)
}

let cache = {}
const indexCacheFilepath = upath.join(cacheDir, 'index.json')
if (fs.existsSync(indexCacheFilepath)) {
  cache = JSON.parse(fs.readFileSync(indexCacheFilepath, 'utf8'))
  console.log('>>> Loaded node_modules.cache/index.json <<<')
}

let tree = {}
const pathsCacheFilepath = upath.join(cacheDir, 'paths.json')
if (fs.existsSync(pathsCacheFilepath)) {
  tree = JSON.parse(fs.readFileSync(pathsCacheFilepath, 'utf8'))
  console.log('>>> Loaded node_modules.cache/paths.json <<<')
}

let shas = {}
const shasCacheFilepath = upath.join(cacheDir, 'shas.json')
if (fs.existsSync(shasCacheFilepath)) {
  shas = JSON.parse(fs.readFileSync(shasCacheFilepath, 'utf8'))
  console.log('>>> Loaded node_modules.cache/shas.json <<<')
}

let files = {}
const filesCacheFilepath = upath.join(cacheDir, 'files.json')
if (fs.existsSync(filesCacheFilepath)) {
  files = JSON.parse(fs.readFileSync(filesCacheFilepath, 'utf8'))
  console.log('>>> Loaded node_modules.cache/files.json <<<')
}

// Now we need to modify the semantics of 'require'
let requireHacker = require('require-hacker')
let alreadyLoaded = new Set()
requireHacker.global_hook('modload', (path, module) => {
  const start = (module === null || module.id === '.') ? '.' : upath.normalizeTrim(upath.joinSafe('./', upath.relative(rootDir, module && module.filename && module.filename.replace(/\.modload/, '') || '')))
  // This is a cheap hack to re-achieve node's module-caching behavior.
  // Took me a while to realize requireHacker wasn't caching modules, which
  // resulted in mutually dependent modules doing an infinite loop.
  if (alreadyLoaded.has(start)) {
    return
  } else {
    alreadyLoaded.add(start)
  }
  // Look up in our cache.
  // TODO: Come back and fix this. This only works because cache.path is out of sync with tree.
  // IN THE END, I WANT A SINGLE INDEX.JSON FILE TO HOLD EVERYTHING.
  if (cache && cache.path && cache.path[start] && cache.path[start][path]) {
    let result = cache.path[start][path]
    let sha = cache.sha[result]
    if (files[sha]) {
      return {
        path: syspath.resolve(rootDir, result), // absolute path
        source: files[sha]
      }
    }
    console.log('reading ' + upath.join(cacheDir, sha))
    let source = fs.readFileSync(upath.join(cacheDir, sha), 'utf8')
    return {
      path: syspath.resolve(rootDir, result), // absolute path
      source
    }
  }
  const result = upath.normalizeTrim(upath.joinSafe('./', upath.relative(rootDir, requireHacker.resolve(path, module))))
  // add to graph
  tree[start] = tree[start] || {}
  tree[start][path] = result
  fileQueue.unshift(result)
  // // Emulate the original behavior.
  // let source = fs.readFileSync(upath.join(rootDir, result), 'utf8')
  // // Handle stupid JSON case.
  // if (upath.extname(result) === '.json') source = 'module.exports = ' + source
  // // Save module to cache by content id
  // let sha = shasum(source)
  // // fs.writeFile(upath.join(cacheDir, sha), source, 'utf8')
  // let foo = {
  //   source,
  //   path: upath.join(rootDir, result)
  // }
  // return foo
  return
})

async function processQueue () {
  let i = 0
  while (fileQueue.length === 0 && i++ < 5) await sleep(1000)
  while (fileQueue.length > 0) {
    const result = fileQueue.pop()
    // Emulate the original behavior.
    let source = await util.promisify(fs.readFile)(upath.join(rootDir, result), 'utf8')
    // Handle stupid JSON case.
    if (upath.extname(result) === '.json') source = 'module.exports = ' + source
    // Save module to cache by content id
    let sha = shasum(source)
    await util.promisify(fs.writeFile)(upath.join(cacheDir, 'unverified-' + sha), source, 'utf8')
    // Add to memory cache
    files[sha] = source
    // Check sha
    let source2 = await util.promisify(fs.readFile)(upath.join(cacheDir, 'unverified-' + sha), 'utf8')
    if (shasum(source2) !== sha) {
      console.log('Corruption during file write, putting ' + sha + ' back into the fileQueue.')
      fileQueue.unshift(result)
    } else {
      console.log(sha + ' === ' + shasum(source2))
      await util.promisify(fs.rename)(upath.join(cacheDir, 'unverified-' + sha), upath.join(cacheDir, sha))
    }
    // Add to our sha cache.
    shas[result] = sha
  }
}

process.on('exit', function () {
  let pathcache = JSON.stringify(sortKeys(tree, {deep: true}), null, 2)
  fs.writeFileSync(pathsCacheFilepath, pathcache, 'utf8')

  let shacache = JSON.stringify(sortKeys(shas, {deep: true}), null, 2)
  fs.writeFileSync(shasCacheFilepath, shacache, 'utf8')

  let filecache = JSON.stringify(sortKeys(files, {deep: true}), null, 2)
  fs.writeFileSync(filesCacheFilepath, filecache, 'utf8')

  let cache = JSON.stringify(sortKeys({
    path: tree,
    sha: shas
  }, {deep: true}), null, 2)
  fs.writeFileSync(indexCacheFilepath, cache, 'utf8')
})

// Begin processing fileQueue
// processQueue()

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

