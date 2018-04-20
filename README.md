# Frontvue

[![Build Status](https://travis-ci.org/0vidiu/frontvue.svg?branch=master)](https://travis-ci.org/0vidiu/frontvue) [![codecov](https://codecov.io/gh/0vidiu/frontvue/branch/master/graph/badge.svg)](https://codecov.io/gh/0vidiu/frontvue) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Front-End plugable build system

[![asciicast](https://asciinema.org/a/7zQAsEdcbd5XmQgaGX8Xolh9q.png)](https://asciinema.org/a/7zQAsEdcbd5XmQgaGX8Xolh9q)

## Status:
- Documentation needs improvement, especially in the plugin authoring section.
- JavaScript related plugins are next to come.

## Quickstart
```bash
# Go to your project's folder
mkdir my-project && cd my-project

# Set up your package.json and add frontvue
yarn init
# or
npm init

yarn add -D @frontvue/core
# or
npm i -D @frontvue/core

# Install plugin(s)
# e.g.
yarn add -D @frontvue/plugin-stylus

# Configure and copy boilerplate templates
frontvue init
# or
fv i

# Start build system in development mode
frontvue dev
# or
fv d

# Start build system in production mode
frontvue build
# or
fv b

# Run a specific sequence
# e.g. config, template, clean, process, watch
frontvue run <hook>
# or
fv r <hook>

# View available commands
frontvue --help
# or
fv -h

# You can combine shorthand commands:
# e.g. fv i, fv init, frontvue i, frontvue init
#      fv d, fv dev, frontvue d, frontvue dev
#      etc.
```

---

## The Problem
Your put together your _Front-End_ or _Back-End_ build system, with _Gulp_ or _Webpack_—or just pure _npm/yarn_ scripts. At some point in the future you need a new feature, so of course, you add it in. Then you need something else that wasn't in the initial plan and sooner rather than later you'll end up with something that barely hangs by a thread and is a mess to update or maintain—not to mention trying to do all of this to someone else's code.

## The Solution
The afore mentioned scenario lead to the creation of this tool: a build system that supports plugins, which allow you to easily bootstrap new projects by running configuration questionnaires, separate the things that should stay separated (e.g. _CSS_, _HTML_, _JS_, _Vue.js_, _React_, _Electron_, etc.) and individually maintain with ease.

Version control for each separate plugin will most likely make things easier as time goes by and you have to reopen old projects that use a deprecated boilerplate. Today you're writing your _CSS_ with _LESS_, but maybe you'll want _Stylus_ for a particular project in the future—and modifying your build system just for that particular project is a hassle.

Each plugin can register to specific hooks and perform actions by taking advantage of _Gulp's_ synchronous and asynchronous taks sequences.

A plugin can copy its boilerplate template files to the current project, watch source files, process and output to the projects build folder.

---

## Plugins for the Future
Here are some of the plugins that you'll be able to choose from and combine when starting a new project:
* __Stylus__ CSS pre-processor (plugin available, but boilerplate template is w.i.p)
* _HTML_ with a modern templating engine (_Pug_, _Handlebars_, etc.)
* _Vue.js_ app boilerplate
* _Typescript_ linting and compilation
* _ES6+_ linting and compilation with _Babel_
* _Electron.js_ app boilerplate
* (More things planned, but I won't spoil the fun...)

---

## Write your own plugins
Guide coming soon...

---

## License
MIT
