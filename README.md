# generator-electron-flask [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Create an Electron App project that auto-starts a Flask server the electron app can call for services.  Deployable as a single App that users can double click on and run.

# Installation

> Before running this generator, ensure you have installed nodejs, npm and python. Read my Python and Nodejs [installation tips](doco/installation-tips.md) if you need assistance.

First, install [Yeoman](http://yeoman.io) and generator-electron-flask using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-electron-flask
```

or from GitHub

```bash
$ git clone https://github.com/abulka/generator-electron-flask
$ cd generator-electron-flask
$ npm install
$ npm link
```

Then generate your new project:

```bash
yo electron-flask
```

## Resulting App

Activate the python virtual environment created by this generator `. venv/bin/activate` then run `npm start`.

Here is the resulting electron app, with a flask server running inside:

![demo](/doco/electron-flask-demo1.gif)

The generated project contains useful demos of sending events, triggering menu items etc. which can all be deleted to make way for your own code.  The javascript libraries `vue.js`, `fomantic` and `jquery` are used in the demos - these references can also be removed if you do not wish to use them.

## To update this generator

    npm update generator-electron-flask -g

Please update regularly as this generator is being actively developed as of mid 2021.

# Scripts

You will find various useful scripts in the `bin` directory of your generated project. You need to put this directory in your `PATH` if you wish to utilise them. There are both Mac, Linux and Windows scripts available. For documentation on these scripts, see [scripts documentation](doco/bin-scripts.md).

It may be possible to make npm script equivalents of these scripts, however since we are coordinating both a python flask app and an electron app, I chose to create bash/batch scripts.

# Typical workflow

You can run the flask app independently by running `bin/runflask`.  Then browse at `http://localhost:5000` to test any ajax endpoints, and endpoints that render html pages.

You can test your electron app by running `bin/runelectron` which will run the electron app and automaticaly run flask in development mode, then kill flask upon exiting.

> Calling `runelectron` aka. `npm start` whilst your python virtual environment is activated is the main workflow for development. 

If you are not using a virtual environment then ensure you have installed all the dependencies in `requirements.txt` into your default Python environment.

For deployment, simply run the script `bin/build` and the resulting app will appear in e.g. `out/YOURAPP-darwin-x64/`.  Double click on it to run it.

# Architecture

The flask server is spawned as a child process by the Electron app main process - see `src/index.js`.  

    ┌──────src/index.html─────────────────────────┐    ┌──────src/index.js───────────────────────────┐
    │                                             │    │                                             │
    │  electron render process html - always here │    │  main electron process javascript           │
    │                                             │    │                                             │
    │  (you can make this html content blank      │    │  (contains code to spawn flask server       │
    │   so that the iframe dominates              │    │   on startup, and kill flask server         │
    │   except the iframe should always be here)  │    │   on quit.)                                 │
    │                                             │    └───┬─────────────────────────────────────────┘
    │ ┌──────iframe────────────────────────────┐  │        ▼                                          
    │ │                                        │  │    ┌──────src-flask-server/app.py────┐            
    │ │  initial flask page displayed here     │  │───▶│                                 │            
    │ │  e.g. /hello                           │  │    │  flask server                   │            
    │ │                                        │──┼───▶│                                 │            
    │ │  all subsequent page navigation happens│◀─┼────│  /hello                         │            
    │ │  inside this iframe.                   │  │    │  /hello-vue                     │            
    │ │                                        │  │    │  /etc                           │            
    │ └────────────────────────────────────────┘  │    │                                 │            
    └─────────────────────────────────────────────┘    └─────────────────────────────────┘            

The other main architectural idea here is that flask rendered pages are loaded in an iframe of the render process browser window. If they are loaded in the main render process browser window, you lose electron interprocess communication. For more information see [page navigation documentation](doco/page-navigation.md).

## Electron Terminology

There are probably better explanations of how Electron works, but here is my understanding, which will help you understand this documentation.

- We start with the nodejs electron `main process` which is pure javascript `src/index.js` and is the entry point. It is a nodejs process with access to the file system and where you define native OS menus etc. It is responsible for launching the browser window containing the UI.  The browser window runs in a separate render process. The main process loads in the initial HTML into the browser window.
- The electron `render process` is the browser window containing e.g. `src/index.html` and its associated javascript. 

Anyone can talk to the flask server - it's just an endpoint:
- the javascript of the main electron process `src/index.js`
- the javascript of the electron render process in `src/index.html` 
- any flask generated html page
 
## File structure generated

Root files

    - package.json        <------ javascript electron project npm config and requirements
    - requirements.txt    <------ flask Python project requirements
    - bin                 <------ handy scripts

Source code dirs

    src                   <------ Javascript Electron App
    ├── index.css
    ├── index.html        <------ electron render process HTML (incl. iframe) + javascript
    └── index.js          <------ electron main process javascript

    src-flask-server/     <------ Python flask server
    ├── app.py
    ├── static
    │   ├── css
    │   │   └── hello.css
    │   ├── images
    │   │   └── hello.png
    │   └── js
    │       └── hello-vue.js
    └── templates
        └── hello.html
        └── hello-vue.html

Temporary build dirs:

    - build/
    - dist/
    - out/

Local Javascript and Python libraries and runtimes:

    - node_modules/
    - venv/

## For production

The Flask executable is created by Pyinstaller. The `template` and `static` dirs, plus the python runtime are embedded in the executable. When the executable runs, all these files are unzipped into a temporary directory, then run.

When you `make` the final Electron executable app, the Flask executable is embedded inside the Electron app in its Resources directory.

# Events

You can communicate between any of these
- a flask page (flask page in render process's iframe)
- the electron render process html page 
- the electron main process

For documentation on how to achieve communication between all the above, see the [events documentation](doco/events.md).

# Debugging your generated project

You can debug both electron and flask in the vscode debugger.

A vscode project directory is generated with some launch configurations ready to go.

## Debugging Electron

Using vscode, you can step into electron by launching with 

```json
{
    "name": "ELECTRON Debug Main Process",
    "type": "node",
    "request": "launch",
    "cwd": "${workspaceFolder}",
    "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
    "windows": {
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
    },
    "args": [
        "."
    ],
    "outputCapture": "std",
    "env": {
        "ELECTRON_FLASK_DONT_LAUNCH_FLASK": "1"
    },    
}
```

Look in the vscode `Debug Console` for output.

See also [electron launching flask documentation](doco/electron-launching-flask.md) for advanced discussion on this important topic.

## Debugging Flask

Using vscode you can launch the flask app with

```json
{
    "name": "Python: Flask",
    "type": "python",
    "request": "launch",
    "module": "flask",
    "env": {
        "FLASK_APP": "src-flask-server.app",
        "FLASK_ENV": "development"
    },
    "args": [
        "run",
        "--no-debugger"
    ],
    "jinja": true
},
```

Note the setting of `FLASK_APP` has been changed from the default of `"app.py"` to `"src-flask-server.app"` to reflect that the flask project is in a subdirectory.


# Misc Notes

## On the use of vue.js in demo

Note that vue is initialised to use `delimiters: ["${", "}"]` to distinguish from the flask templating `{{ }}`.

## Husky pre commit

During the development of this project, checking in using git would trigger a pre commit hook that runs husky. For some reason husky would try to scan the templates folder and complain about invalid syntax - due to the yoeman <%> tags. Not sure why this template folder isn't being completely ignored?  

Quick fix

    mv .git/hooks/pre-commit .git/hooks/pre-commit-OFFLINE

Temporary fix

    git commit --no-verify

More discussion: https://stackoverflow.com/questions/63943401/husky-pre-commit-hook-failed-add-no-verify-to-bypass

# License

Apache-2.0 © [Andy Bulka]()

[npm-image]: https://badge.fury.io/js/generator-electron-flask.svg
[npm-url]: https://npmjs.org/package/generator-electron-flask
[travis-image]: https://travis-ci.com/abulka/generator-electron-flask.svg?branch=master
[travis-url]: https://travis-ci.com/abulka/generator-electron-flask
[daviddm-image]: https://david-dm.org/abulka/generator-electron-flask.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/abulka/generator-electron-flask

