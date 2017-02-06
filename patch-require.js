#!/usr/bin/env node
'use strict'
/*
 * This should be used to launch applications installed with M.I.
 * It alters the behavior of 'require' so that we can take advantage of the global machine module store.
 */
require = require('really-need')
// let Module = require('module')
// let path = require('path')
// let os = require('os')
// let childProcess = require('child_process')

// console.log('module.id =', module.id)
// console.log('module.parent =', module.parent)
// console.log('module.filename =', module.filename)
// console.log('module.paths =', module.paths)

//console.log(String(Module._load))
//  console.log(String(Module._resolveFilename))
//    console.log(String(Module._resolveLookupPaths))
// console.log(String(Module._nodeModulePaths))
//  console.log(String(Module))

module.exports = function (modulePath) {
  require(modulePath, {
    fake: () => `console.log("You tried to run ${modulePath}")`
  })
}
// 
// const orig_load = Module.require
// 
// Module._load = function(...args) {
//   let request = args[0]
//   let parent = args[1]
//   let isMain = args[2]
//   console.log('_load arguments', [request, parent ? ('Module ' + parent.id) : parent, isMain])
//   let tmp = orig_load(...args)
//   // let keepThisFirst = tmp.shift()
//   // tmp.unshift(from + '+node_modules')
//   // tmp.unshift(keepThisFirst)
//   console.log('_load returns', tmp)
//   return tmp
// }
// 
// const orig_load = Module._load
// 
// Module._load = function(...args) {
//   let request = args[0]
//   let parent = args[1]
//   let isMain = args[2]
//   console.log('_load arguments', [request, parent ? ('Module ' + parent.id) : parent, isMain])
//   let tmp = orig_load(...args)
//   // let keepThisFirst = tmp.shift()
//   // tmp.unshift(from + '+node_modules')
//   // tmp.unshift(keepThisFirst)
//   console.log('_load returns', tmp)
//   return tmp
// }
// 
// const orig_resolveFilename = Module._resolveFilename
// 
// Module._resolveFilename = function(...args) {
//   let request = args[0]
//   let parent = args[1]
//   console.log('_resolveFilename arguments', [request, parent ? ('Module ' + parent.id) : parent])
//   let paths = orig_resolveFilename(...args)
//   // for (let i in paths) {
//   //   let p = paths[i]
//   //   let n = p.lastIndexOf(path.sep)
//   //   paths[i] = p.slice(0, n) + '+' + p.slice(n + 1)
//   // }
//   console.log('_resolveFilename returns', paths)
//   return paths
// }
// 
// const orig_nodeModulePaths = Module._nodeModulePaths
// 
// Module._nodeModulePaths = function(...args) {
//   console.log('_nodeModulePaths arguments', args)
//   // let from = args[0]
//   let paths = orig_nodeModulePaths(...args)
//   for (let i in paths) {
//     let p = paths[i]
//     let n = p.lastIndexOf(path.sep)
//     paths[i] = p.slice(0, n) + '+' + p.slice(n + 1)
//   }
//   console.log('_nodeModulePaths returns', paths)
//   return paths
// }
// 
// const orig_resolveLookupPaths = Module._resolveLookupPaths
// 
// Module._resolveLookupPaths = function(...args) {
// //  console.log(args)
//   let request = args[0]
//   let parent = args[1]
//   console.log('_resolveLookupPaths arguments', [request, parent ? ('Module ' + parent.id) : parent])
//   let [id, paths] = orig_resolveLookupPaths(...args)
//   // for (let i in paths) {
//   //   let p = paths[i]
//   //   let n = p.lastIndexOf(path.sep)
//   //   paths[i] = p.slice(0, n) + '+' + p.slice(n + 1)
//   // }
//   if (paths) {
//     paths.unshift(path.win32.resolve(os.homedir(), '.store/v1/node_modules'))
//   }
//   console.log('_resolveLookupPaths returns', [id, paths])
//   return [id, paths]
// }
// console.log(process.argv[1])
// // Module._load(path.resolve(process.argv[1]))
