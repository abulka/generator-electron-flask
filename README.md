# generator-electron-flask [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Create an Electron App project that auto-starts a Flask server the electron app can call for services.  Deployable as a single App that users can double click on and run.

## Installation

> Before running this generator, ensure you have installed nodejs, npm and python. Read my Python and Nodejs [installation tips](doco/installation-tips.md).

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

### To update this generator

    npm update generator-electron-flask -g

## Scripts in `./bin` inside your newly created project

These are a collection of handy bash and .bat scripts for building and running both flask and electron, in your new project.

> These scripts assume that a local Python exists in the `./venv` directory root of your generated project. This Yoeman generator would have created that for you.

You will need to add `bin` to your PATH, after which, you can invoke any script residing in ./bin from the root of your newly created project, e.g. by typing `runflask`.  This will work for both Mac/Linux and Windows 10. In Windows 10 the `.bat` script will be found, not the bash script.

Also, because some of these scripts call each other, you must have `./bin` in your PATH.

### Mac, Linux

Edit your `~/.bashrc` and add:

    export PATH="./bin:$PATH"

then start a fresh shell.

### Windows 10

Use Command Prompt terminal (not powershell) to run these scripts.

Add `bin` to your 'Environment Variables / User variables for USER / Path' using the built in editor, which you can find by typing 'path' into the windows search bar and selecting 'Edit the system environment variables' menu item.

> Ensure you close all running terminals and shells and open a fresh terminal. In 'Command Prompt' shell type `PATH` and ensure the relative path to bin has been added ok e.g. Notice the last entry below:

    ...;bin;

### Meaning of 'exe'  

- Flask 'exe' refers to the executable file generated by PyInstaller. Of course on Linux/Mac systems, those executables don't have the `.exe` file extension. I still refer to them as 'exe's.
- Electron 'exe' refers to the final executable Electron based app, which can be distributed to users.

### High Level Scripts

The script `bin/run` does everything

- installs dependencies, 
- builds both the flask and electron executables, and 
- runs the final electron based app

If you don't want to run, just invoke `bin/build`.

> Because these scripts call each other, you must have `./bin` in your PATH.

### Build Scripts

For building the flask exe and electron exe.  

When building the electron executable, the flask executable is embedded inside the electron executable.

**Script Name**|**Description**
:-----:|:-----
install-deps| Install python and node dependencies
build| Builds the flask exe and electron exe
buildelectron-exe| Build the electron exe
buildflask-exe| Builds the flask exe using Pyinstaller

### Run Scripts

For running the flask server in development and also in executable mode, as well as when it is packaged inside the electron executable.

For running the electron app in development mode, and launching the final electron executable from the command line. Of course you can also double click on the final electron executable to launch it too. 

> On Linux double click on the final electron executable will probably fail - see [linux notes](doco/building-apps-for-linux.md)

**Script Name**|**Description**
:-----:|:-----
run| Does everything, installs dependencies, builds both the flask and electron executables, and runs the final electron based app. During development and testing, you probably want to use the more granular build and run scripts.
runelectron| Runs the electron based app in development mode using `npm start`. Flask is also started in development mode via the electron main process spawning it.
runelectron-exe| Runs the final electron based app. If you want to build this, first run `buildflask-exe` followed by `buildelectron-exe`.
runflask| Run flask in development mode using `python src-flask-server/app.py`
runflask-exe| run the flask executable that was built by Pyinstaller.  If you want to build this flask exe please run the script `buildflask-exe`.
runflask-exe-inside-electron| Run the flask executable which has been embedded inside the electron app - use for debugging

### Utility Scripts

Misc scripts you might use during development.

**Script Name**|**Description**
:-----:|:-----
whos-on-flask-port| See what processes are running on port 5000 (or whatever port number you chose in the yo generator wizard) which is the default flask server port - handy just in case flask is still running and wasn't killed when the electron app exited. Kill it using `kill pid` using the process id listed.

For Windows 10

    - command prompt: run `whos-on-flask-port` which invokes `bin\whos-on-flask-port.bat`
    - powershell: run `bin\whos-on-flask-port` which invokes `bin\whos-on-flask-port.ps1`

## Typical workflow

You can test the flask app independently by running `runflask`.

You can test your electron app by running `runelectron` which will automaticaly run flask in development mode, then kill flask upon exiting.

For deployment, simply run the script `build` and the resulting app will appear in e.g. `out/YOURAPP-darwin-x64/`.  Double click on it to run it.

## Architecture

Flask is spawned as a child process the the Electron app main process - see `src/index.js`.  For production, Flask is embedded inside the Electron app as an executable in its Resources directory.

The Flask executable is created by Pyinstaller. When the executable runs, the tempates and static dirs, plus the python runtime are unzipped into a temporary directory, then run.

### File structure generated


root files

    package.json        javascript electron project npm config and requirements
    requirements.txt    flask Python project requirements
    bin                 handy scripts

source code dirs

    src
    ├── index.css
    ├── index.html
    └── index.js

    src-flask-server/
    ├── app.py
    ├── static
    │   ├── css
    │   │   └── hello.css
    │   ├── images
    │   │   └── hello.png
    │   └── js
    │       └── hello.js
    └── templates
        └── hello.html

build dirs

    build
    dist
    out

local js and python libraries and runtimes, to ignore

    node_modules
    venv

### Tips

`src-flask-server/static/js/hello.js` is meant to be used by flask template (if you say yes to the sample demo), used by template `src-flask-server/templates/hello.html` - not currently included.

### Note on the use of vue.js in demo

Note that vue is initialised to use `delimiters: ["${", "}"]` to distinguish from the flask templating `{{ }}`.

## Husky pre commit

During the development of this project, checking in using git would trigger a pre commit hook that runs husky. For some reason husky would try to scan the templates folder and complain about invalid syntax - due to the yoeman <%> tags. Not sure why this template folder isn't being completely ignored?  

Quick fix

    mv .git/hooks/pre-commit .git/hooks/pre-commit-OFFLINE

Temporary fix

    git commit --no-verify

More discussion: https://stackoverflow.com/questions/63943401/husky-pre-commit-hook-failed-add-no-verify-to-bypass

## License

Apache-2.0 © [Andy Bulka]()

[npm-image]: https://badge.fury.io/js/generator-electron-flask.svg
[npm-url]: https://npmjs.org/package/generator-electron-flask
[travis-image]: https://travis-ci.com/abulka/generator-electron-flask.svg?branch=master
[travis-url]: https://travis-ci.com/abulka/generator-electron-flask
[daviddm-image]: https://david-dm.org/abulka/generator-electron-flask.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/abulka/generator-electron-flask

