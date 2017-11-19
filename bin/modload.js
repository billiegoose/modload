#!/usr/bin/env node
let Module = require('module')
const fs = require('fs')
const upath = require('upath')
const syspath = require('path')
const sortKeys = require('sort-keys')
const shasum = require('shasum')
const util = require('util')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Remove the modrun.js argument, so the actual main module isn't confused when it parses argv.
process.argv.splice(1, 1)

// For easier reading of output, lets shave some path info.
let rootDir = upath.dirname(upath.resolve(process.argv[1]))

let paths = {}
let shas = {}
let files = {}
// See if we have an existing cache.
const indexCacheFilepath = upath.join(rootDir, '.modload-cache.json')
if (fs.existsSync(indexCacheFilepath)) {
  let cache = JSON.parse(fs.readFileSync(indexCacheFilepath, 'utf8'))
  paths = cache.paths
  shas = cache.shas
  files = cache.files
  console.log('>>> Loaded node_modules.cache/index.json <<<')
}

// Now we need to modify the semantics of 'require'
let requireHacker = require('require-hacker')
let alreadyLoaded = new Set()
requireHacker.global_hook('modload', (path, module) => {
  const start = (module === null || module.id === '.') ? '.' : upath.normalizeTrim(upath.joinSafe('./', upath.relative(rootDir, module && module.filename && module.filename.replace(/\.modload/, '') || '')))
  const result = (paths && paths[start] && paths[start][path]) || upath.normalizeTrim(upath.joinSafe('./', upath.relative(rootDir, requireHacker.resolve(path, module))))
  // add to graph
  paths[start] = paths[start] || {}
  paths[start][path] = result
  // This is a cheap hack to re-achieve node's module-caching behavior.
  // Took me a while to realize requireHacker wasn't caching modules, which
  // resulted in circular dependencies creating an infinite loop and crashing the program with no error message.
  if (alreadyLoaded.has(result)) {
    console.log('REUSING INSTANCE', start, path, result)
    return
  } else {
    alreadyLoaded.add(result)
  }
  // Look up in our cache.
  let sha = shas[result]
  if (files[sha]) {
    console.log('FROM CACHEINDEX', start, path)
    return {
      path: syspath.resolve(rootDir, result), // absolute path
      source: files[sha]
    }
  }
  console.log('FROM NODE_MODULES', start, path)
  // Emulate the original behavior.
  util.promisify(fs.readFile)(upath.join(rootDir, result), 'utf8')
  .then(source => {
    // Handle stupid JSON case.
    if (upath.extname(result) === '.json') source = 'module.exports = ' + source
    // Save module to cache by content id
    let sha = shasum(source)
    // Add to our sha cache.
    shas[result] = sha
    // Add to file cache
    files[sha] = source
  })
  return
})

process.on('exit', function () {
  let cache = JSON.stringify(sortKeys({
    paths,
    shas,
    files
  }, {deep: true}), null, 2)
  fs.writeFileSync(indexCacheFilepath, cache, 'utf8')
})

// Finally, we need to convince this module he's the main module.
// Unfortunately, this is not part of the documented API.
// https://github.com/nodejs/node/blob/master/lib/module.js#L602
Module.runMain(process.argv[1])
