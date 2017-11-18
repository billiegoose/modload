<!-- TITLE/ -->

<h1>modload</h1>

<!-- /TITLE -->


<!-- BADGES/ -->



<!-- /BADGES -->


<!-- DESCRIPTION/ -->

## 5 year plan

Phase 1 [complete] is to hook into the `require` function and
add some logging to trace what modules are being loaded and from where.

Phase 2 [complete] will be to serialize this data and cache it, so that the next time you
run the program it will skip Node's slow `require` algorithm full of file existance checks
and simply load them from where it learned they were last time.

Phase 3 will be to trace filesystem calls just like we trace require calls,
and figure out cases where modules are making implicit assumptions about their
physical file system locations.

Phase 4 will be to lock down the filesystem module so that modules cannot access
files outside a user-controlled jail directory.

Phase 5 will be to virtualize the filesystem and require functionality, so that
modules can be physically de-duplicated and our cache handles module resolution
based on its knowledge of prior runs.

Phase 6 will be to replicate the filesystem and require resolution algorithm
so that we are able to predict how modules would get resolved without even
running them normally once to record their relationships.

Phase 7 will be an analysis of whether popular modules would work fine in a
readonly filesystem, and if not implement an overlay tempfile system similar to
docker's.

Phase 8 will be running a Node app without any installation - module resolution
is done at runtime and packages are downloaded as needed on first use, and stay
in their tarballed form and only extracted in memory.

Phase 9 will be validating the checksum of these tarballs when the module loads,
providing previously infeasible levels of authenticity.

Phase 10 will be switching to P2P distribution mechanism of the tarballs.

> Around now it would be a good time to start coordinating a leadership/steering
> committee for the future collective codebase that is basically running the
> world at this point.

Phase 11 will be installing every package ever on a single machine and attempting
to run all the unit tests.

Phase 12 will be modifying `dont-break` and `next-update` and `semantic-release`
in order to continually test dependencies and automatically upgrade them.

Phase 13 will be figuring out how applications in production can opt-in
to auto-updating modules that have security vulnerabilities. I can't yet say
whether that mechanism will be a hot module reloader or require a restart.

Phase 14 will be switching from editing individual modules, to authors creating
tools for mass-editing modules, so we can keep modules up to date, migrate them
to ES2020, consolidate code to reduce attack surface, adjust them to comply with
licensing terms, are just a few ideas I have.

<!-- /DESCRIPTION -->


## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

```sh
npm install --global modload
```

## Usage

```
$ modload ./test/fixture/server.js
╔══════════════════════╤════════════════════════════════════════════════════╤══════════════════════╗
║ Module               │ Required Path                                      │ Resolved Path        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║                      │ ./test/fixture/server.js                           │ \server.js           ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ .                    │ express                                            │ \node_modules\expres ║
║                      │                                                    │ s\index.js           ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./lib/express                                      │ \node_modules\expres ║
║ s\index.js           │                                                    │ s\lib\express.js     ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ merge-descriptors                                  │ \node_modules\merge- ║
║ s\lib\express.js     │                                                    │ descriptors\index.js ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./application                                      │ \node_modules\expres ║
║ s\lib\express.js     │                                                    │ s\lib\application.js ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ finalhandler                                       │ \node_modules\finalh ║
║ s\lib\application.js │                                                    │ andler\index.js      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\finalh │ debug                                              │ \node_modules\debug\ ║
║ andler\index.js      │                                                    │ node.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\debug\ │ ./debug                                            │ \node_modules\debug\ ║
║ node.js              │                                                    │ debug.js             ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\debug\ │ ms                                                 │ \node_modules\ms\ind ║
║ debug.js             │                                                    │ ex.js                ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\finalh │ escape-html                                        │ \node_modules\escape ║
║ andler\index.js      │                                                    │ -html\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\finalh │ on-finished                                        │ \node_modules\on-fin ║
║ andler\index.js      │                                                    │ ished\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\on-fin │ ee-first                                           │ \node_modules\ee-fir ║
║ ished\index.js       │                                                    │ st\index.js          ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\finalh │ statuses                                           │ \node_modules\status ║
║ andler\index.js      │                                                    │ es\index.js          ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\status │ ./codes.json                                       │ \node_modules\status ║
║ es\index.js          │                                                    │ es\codes.json        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\finalh │ unpipe                                             │ \node_modules\unpipe ║
║ andler\index.js      │                                                    │ \index.js            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./router                                           │ \node_modules\expres ║
║ s\lib\application.js │                                                    │ s\lib\router\index.j ║
║                      │                                                    │ s                    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./route                                            │ \node_modules\expres ║
║ s\lib\router\index.j │                                                    │ s\lib\router\route.j ║
║ s                    │                                                    │ s                    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ debug                                              │ \node_modules\debug\ ║
║ s\lib\router\route.j │                                                    │ node.js              ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ array-flatten                                      │ \node_modules\array- ║
║ s\lib\router\route.j │                                                    │ flatten\array-flatte ║
║ s                    │                                                    │ n.js                 ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./layer                                            │ \node_modules\expres ║
║ s\lib\router\route.j │                                                    │ s\lib\router\layer.j ║
║ s                    │                                                    │ s                    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ path-to-regexp                                     │ \node_modules\path-t ║
║ s\lib\router\layer.j │                                                    │ o-regexp\index.js    ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ debug                                              │ \node_modules\debug\ ║
║ s\lib\router\layer.j │                                                    │ node.js              ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ methods                                            │ \node_modules\method ║
║ s\lib\router\route.j │                                                    │ s\index.js           ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./layer                                            │ \node_modules\expres ║
║ s\lib\router\index.j │                                                    │ s\lib\router\layer.j ║
║ s                    │                                                    │ s                    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ methods                                            │ \node_modules\method ║
║ s\lib\router\index.j │                                                    │ s\index.js           ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ utils-merge                                        │ \node_modules\utils- ║
║ s\lib\router\index.j │                                                    │ merge\index.js       ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ debug                                              │ \node_modules\debug\ ║
║ s\lib\router\index.j │                                                    │ node.js              ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ depd                                               │ \node_modules\depd\i ║
║ s\lib\router\index.j │                                                    │ ndex.js              ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\depd\i │ ./lib/compat                                       │ \node_modules\depd\l ║
║ ndex.js              │                                                    │ ib\compat\index.js   ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\depd\i │ ./lib/compat                                       │ \node_modules\depd\l ║
║ ndex.js              │                                                    │ ib\compat\index.js   ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ array-flatten                                      │ \node_modules\array- ║
║ s\lib\router\index.j │                                                    │ flatten\array-flatte ║
║ s                    │                                                    │ n.js                 ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ parseurl                                           │ \node_modules\parseu ║
║ s\lib\router\index.j │                                                    │ rl\index.js          ║
║ s                    │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ methods                                            │ \node_modules\method ║
║ s\lib\application.js │                                                    │ s\index.js           ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./middleware/init                                  │ \node_modules\expres ║
║ s\lib\application.js │                                                    │ s\lib\middleware\ini ║
║                      │                                                    │ t.js                 ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./middleware/query                                 │ \node_modules\expres ║
║ s\lib\application.js │                                                    │ s\lib\middleware\que ║
║                      │                                                    │ ry.js                ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ parseurl                                           │ \node_modules\parseu ║
║ s\lib\middleware\que │                                                    │ rl\index.js          ║
║ ry.js                │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ qs                                                 │ \node_modules\qs\lib ║
║ s\lib\middleware\que │                                                    │ \index.js            ║
║ ry.js                │                                                    │                      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\qs\lib │ ./stringify                                        │ \node_modules\qs\lib ║
║ \index.js            │                                                    │ \stringify.js        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\qs\lib │ ./utils                                            │ \node_modules\qs\lib ║
║ \stringify.js        │                                                    │ \utils.js            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\qs\lib │ ./parse                                            │ \node_modules\qs\lib ║
║ \index.js            │                                                    │ \parse.js            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\qs\lib │ ./utils                                            │ \node_modules\qs\lib ║
║ \parse.js            │                                                    │ \utils.js            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ debug                                              │ \node_modules\debug\ ║
║ s\lib\application.js │                                                    │ node.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./view                                             │ \node_modules\expres ║
║ s\lib\application.js │                                                    │ s\lib\view.js        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ debug                                              │ \node_modules\debug\ ║
║ s\lib\view.js        │                                                    │ node.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\view.js        │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ content-disposition                                │ \node_modules\conten ║
║ s\lib\utils.js       │                                                    │ t-disposition\index. ║
║                      │                                                    │ js                   ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ content-type                                       │ \node_modules\conten ║
║ s\lib\utils.js       │                                                    │ t-type\index.js      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ depd                                               │ \node_modules\depd\i ║
║ s\lib\utils.js       │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ array-flatten                                      │ \node_modules\array- ║
║ s\lib\utils.js       │                                                    │ flatten\array-flatte ║
║                      │                                                    │ n.js                 ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ send                                               │ \node_modules\send\i ║
║ s\lib\utils.js       │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ http-errors                                        │ \node_modules\http-e ║
║ ndex.js              │                                                    │ rrors\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\http-e │ setprototypeof                                     │ \node_modules\setpro ║
║ rrors\index.js       │                                                    │ totypeof\index.js    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\http-e │ statuses                                           │ \node_modules\status ║
║ rrors\index.js       │                                                    │ es\index.js          ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\http-e │ inherits                                           │ \node_modules\inheri ║
║ rrors\index.js       │                                                    │ ts\inherits.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ debug                                              │ \node_modules\debug\ ║
║ ndex.js              │                                                    │ node.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ depd                                               │ \node_modules\depd\i ║
║ ndex.js              │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ destroy                                            │ \node_modules\destro ║
║ ndex.js              │                                                    │ y\index.js           ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ encodeurl                                          │ \node_modules\encode ║
║ ndex.js              │                                                    │ url\index.js         ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ escape-html                                        │ \node_modules\escape ║
║ ndex.js              │                                                    │ -html\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ etag                                               │ \node_modules\etag\i ║
║ ndex.js              │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ fresh                                              │ \node_modules\fresh\ ║
║ ndex.js              │                                                    │ index.js             ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ mime                                               │ \node_modules\mime\m ║
║ ndex.js              │                                                    │ ime.js               ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\mime\m │ ./types.json                                       │ \node_modules\mime\t ║
║ ime.js               │                                                    │ ypes.json            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ ms                                                 │ \node_modules\send\n ║
║ ndex.js              │                                                    │ ode_modules\ms\index ║
║                      │                                                    │ .js                  ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ on-finished                                        │ \node_modules\on-fin ║
║ ndex.js              │                                                    │ ished\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ range-parser                                       │ \node_modules\range- ║
║ ndex.js              │                                                    │ parser\index.js      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\send\i │ statuses                                           │ \node_modules\status ║
║ ndex.js              │                                                    │ es\index.js          ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ etag                                               │ \node_modules\etag\i ║
║ s\lib\utils.js       │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ proxy-addr                                         │ \node_modules\proxy- ║
║ s\lib\utils.js       │                                                    │ addr\index.js        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\proxy- │ forwarded                                          │ \node_modules\forwar ║
║ addr\index.js        │                                                    │ ded\index.js         ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\proxy- │ ipaddr.js                                          │ \node_modules\ipaddr ║
║ addr\index.js        │                                                    │ .js\lib\ipaddr.js    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ qs                                                 │ \node_modules\qs\lib ║
║ s\lib\utils.js       │                                                    │ \index.js            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\application.js │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\application.js │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\application.js │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ depd                                               │ \node_modules\depd\i ║
║ s\lib\application.js │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ array-flatten                                      │ \node_modules\array- ║
║ s\lib\application.js │                                                    │ flatten\array-flatte ║
║                      │                                                    │ n.js                 ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ utils-merge                                        │ \node_modules\utils- ║
║ s\lib\application.js │                                                    │ merge\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./router/route                                     │ \node_modules\expres ║
║ s\lib\express.js     │                                                    │ s\lib\router\route.j ║
║                      │                                                    │ s                    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./router                                           │ \node_modules\expres ║
║ s\lib\express.js     │                                                    │ s\lib\router\index.j ║
║                      │                                                    │ s                    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./request                                          │ \node_modules\expres ║
║ s\lib\express.js     │                                                    │ s\lib\request.js     ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ accepts                                            │ \node_modules\accept ║
║ s\lib\request.js     │                                                    │ s\index.js           ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\accept │ negotiator                                         │ \node_modules\negoti ║
║ s\index.js           │                                                    │ ator\index.js        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\accept │ mime-types                                         │ \node_modules\mime-t ║
║ s\index.js           │                                                    │ ypes\index.js        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\mime-t │ mime-db                                            │ \node_modules\mime-d ║
║ ypes\index.js        │                                                    │ b\index.js           ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\mime-d │ ./db.json                                          │ \node_modules\mime-d ║
║ b\index.js           │                                                    │ b\db.json            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ depd                                               │ \node_modules\depd\i ║
║ s\lib\request.js     │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ type-is                                            │ \node_modules\type-i ║
║ s\lib\request.js     │                                                    │ s\index.js           ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\type-i │ media-typer                                        │ \node_modules\media- ║
║ s\index.js           │                                                    │ typer\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\type-i │ mime-types                                         │ \node_modules\mime-t ║
║ s\index.js           │                                                    │ ypes\index.js        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ fresh                                              │ \node_modules\fresh\ ║
║ s\lib\request.js     │                                                    │ index.js             ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ range-parser                                       │ \node_modules\range- ║
║ s\lib\request.js     │                                                    │ parser\index.js      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ parseurl                                           │ \node_modules\parseu ║
║ s\lib\request.js     │                                                    │ rl\index.js          ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ proxy-addr                                         │ \node_modules\proxy- ║
║ s\lib\request.js     │                                                    │ addr\index.js        ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./response                                         │ \node_modules\expres ║
║ s\lib\express.js     │                                                    │ s\lib\response.js    ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ content-disposition                                │ \node_modules\conten ║
║ s\lib\response.js    │                                                    │ t-disposition\index. ║
║                      │                                                    │ js                   ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ depd                                               │ \node_modules\depd\i ║
║ s\lib\response.js    │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ encodeurl                                          │ \node_modules\encode ║
║ s\lib\response.js    │                                                    │ url\index.js         ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ escape-html                                        │ \node_modules\escape ║
║ s\lib\response.js    │                                                    │ -html\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\response.js    │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ on-finished                                        │ \node_modules\on-fin ║
║ s\lib\response.js    │                                                    │ ished\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ utils-merge                                        │ \node_modules\utils- ║
║ s\lib\response.js    │                                                    │ merge\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ cookie-signature                                   │ \node_modules\cookie ║
║ s\lib\response.js    │                                                    │ -signature\index.js  ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\response.js    │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\response.js    │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./utils                                            │ \node_modules\expres ║
║ s\lib\response.js    │                                                    │ s\lib\utils.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ cookie                                             │ \node_modules\cookie ║
║ s\lib\response.js    │                                                    │ \index.js            ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ send                                               │ \node_modules\send\i ║
║ s\lib\response.js    │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ vary                                               │ \node_modules\vary\i ║
║ s\lib\response.js    │                                                    │ ndex.js              ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ ./middleware/query                                 │ \node_modules\expres ║
║ s\lib\express.js     │                                                    │ s\lib\middleware\que ║
║                      │                                                    │ ry.js                ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\expres │ serve-static                                       │ \node_modules\serve- ║
║ s\lib\express.js     │                                                    │ static\index.js      ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\serve- │ encodeurl                                          │ \node_modules\encode ║
║ static\index.js      │                                                    │ url\index.js         ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\serve- │ escape-html                                        │ \node_modules\escape ║
║ static\index.js      │                                                    │ -html\index.js       ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\serve- │ parseurl                                           │ \node_modules\parseu ║
║ static\index.js      │                                                    │ rl\index.js          ║
╟──────────────────────┼────────────────────────────────────────────────────┼──────────────────────╢
║ \node_modules\serve- │ send                                               │ \node_modules\send\i ║
║ static\index.js      │                                                    │ ndex.js              ║
╚══════════════════════╧════════════════════════════════════════════════════╧══════════════════════╝
```

<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; William Hilton</li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/Unlicense.html">The Unlicense</a></li></ul>

<!-- /LICENSE -->


_Parts of this file are based on [package-json-to-readme](https://github.com/zeke/package-json-to-readme)_

_README.md (and other files) are maintained using [mos](https://github.com/mosjs/mos) and [projectz](https://github.com/bevry/projectz)_
