# generator-electron-flask [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> Create an Electron App project that auto-starts a Flask server the electron app can call for services.  Deployable as a single App that users can double click on and run.

# Installation

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

## To update this generator

    npm update generator-electron-flask -g

Please check regularly as this generator is being updated regularly (June 2021).

# Scripts in `./bin` inside your newly created project

These are a collection of handy bash and .bat scripts for building and running both flask and electron, in your new project.

> These scripts assume that a local Python exists in the `./venv` directory root of your generated project. This Yoeman generator would have created that for you.

You will need to add `bin` to your PATH, after which, you can invoke any script residing in ./bin from the root of your newly created project, e.g. by typing `runflask`.  This will work for both Mac/Linux and Windows 10. In Windows 10 the `.bat` script will be found, not the bash script.

Also, because some of these scripts call each other, you must have `./bin` in your PATH.

## Mac, Linux

Edit your `~/.bashrc` and add:

    export PATH="./bin:$PATH"

then start a fresh shell.

## Windows 10

Use Command Prompt terminal (not powershell) to run these scripts.

Add `bin` to your 'Environment Variables / User variables for USER / Path' using the built in editor, which you can find by typing 'path' into the windows search bar and selecting 'Edit the system environment variables' menu item.

Then ensure you close all running terminals and shells and open a fresh terminal. In 'Command Prompt' shell type `PATH` and check to ensure the relative path to `bin` has been added ok e.g. Look for the entry below:

    ...;bin;

## Meaning of 'exe'  

- Flask 'exe' refers to the executable file generated by PyInstaller. Of course on Linux/Mac systems, those executables don't have the `.exe` file extension. I still refer to them as 'exe's.
- Electron 'exe' refers to the final executable Electron based app, which can be distributed to users.

## High Level Scripts

The script `bin/run` does everything

- installs dependencies, 
- builds both the flask and electron executables, and 
- runs the final electron based app

If you don't want to run, just invoke `bin/build`.

> Because these scripts call each other, you must have `./bin` in your PATH.

## Build Scripts

For building the flask exe and electron exe.  

When building the electron executable, the flask executable is embedded inside the electron executable.

**Script Name**|**Description**
:-----:|:-----
install-deps| Install python and node dependencies
build| Builds the flask exe and electron exe
buildelectron-exe| Build the electron exe
buildflask-exe| Builds the flask exe using Pyinstaller

## Run Scripts

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

## Utility Scripts

Misc scripts you might use during development.

**Script Name**|**Description**
:-----:|:-----
whos-on-flask-port| See what processes are running on port 5000 (or whatever port number you chose in the yo generator wizard) which is the default flask server port - handy just in case flask is still running and wasn't killed when the electron app exited. Kill it using `kill pid` using the process id listed.

For Windows 10

    - command prompt: run `whos-on-flask-port` which invokes `bin\whos-on-flask-port.bat`
    - powershell: run `bin\whos-on-flask-port` which invokes `bin\whos-on-flask-port.ps1`

# Typical workflow

You can test the flask app independently by running `runflask`.

You can test your electron app by running `runelectron` which will automaticaly run flask in development mode, then kill flask upon exiting.

For deployment, simply run the script `build` and the resulting app will appear in e.g. `out/YOURAPP-darwin-x64/`.  Double click on it to run it.

# Architecture

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

Flask is spawned as a child process the the Electron app main process - see `src/index.js`.  

Anyone can talk to the flask server - it's just an endpoint:
- the javascript of the main electron process `src/index.js`
- the javascript of the electron render process in `src/index.html` 
- any other flask html page

## File structure generated


root files

    package.json        javascript electron project npm config and requirements
    requirements.txt    flask Python project requirements
    bin                 handy scripts

source code dirs

    src   <------ Javascript Electron App
    ├── index.css
    ├── index.html
    └── index.js

    src-flask-server/     <------ PYTHON flask server
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

build dirs:

    build
    dist
    out

local js and python libraries and runtimes, to ignore:

    node_modules
    venv

## For production

The Flask executable is created by Pyinstaller. The `template` and `static` dirs, plus the python runtime are embedded in the executable. When the executable runs, all these files are unzipped into a temporary directory, then run.

When you `make` the final Electron executable app, the Flask executable is embedded inside the Electron app in its Resources directory.

## Page navigation

Links to flask rendered pages in the renderer process html e.g. if
`src/index.html` contained
    
    <a href="http://localhost:5000/hello">hello</a>

is bad because whilst it works, you navigate away from the render process html
page and can never navigate back. This means you lose the ability to talk to the
render process from flask pages - which is a useful thing to be able to do. You
also give up the ability to talk to the electron main process via the render
process html page.

### Solution to page navigation
The solution is to load flask pages into an iframe instead. This way the render
process html always exists. Flask pages can then communicate with the render
process html `src/index.html` using custom events (note event bubbling won't
work because it stops at document boundaries). Also flask html pages can
communicate with the main process `src/index.js` via the render
process html using standard electron communication techniques.

And of course all of the following can communicate with the flask server:
- the electron render process html `src/index.html`
- the election main process `src/index.js`
- flask rendered pages

### P.S. on page navigation

Note that Electron restarts the renderer process when a new URL is loaded, so you'll probably see a flash when that happens. This is why it's usually best to use a single page application (SPA) architecture when building Electron apps.  https://stackoverflow.com/questions/39880979/electron-how-to-load-a-html-file-into-the-current-window

Note that the iframe based solution is a kind of combination SPA (in the sense that the renderer process html stays around and is the `S` in SPA) and has the multiple flask pages _via the iframe_.

### Initial flask page

The initial page displayed in the iframe comes from the flask server and the url is prompted for when running this generator.

For example, if you want the initial page to be `/hello` then type in `hello` when prompted. Ensure you have a flask server endpoint that responds to this route.  E.g. in `src-flask-server/app.py` ensure you have something like:

```python
@app.route('/hello')
def hello():
    return render_template('hello.html', msg="YOU")
```

> Note: the above route is auto created by the project.

# Events

You can communicate between any of these
- a flask page (flask page in render process's iframe)
- the electron render process html page 
- the electron main process

A flask page actually lives inside an iframe of the render process.

## Flask -> Render -> Main

The way to communicate between electron processes is documented by the [Electron documentation](https://www.electronjs.org/docs/api/ipc-main) and tutorials like [this](https://www.tutorialspoint.com/electron/electron_inter_process_communication.htm).

The only trick that electron-flask needs to achieve is to communicate from the flask page living in the iframe to the parent render process page.

Simply send a custom event from the iframe's flask rendered HTML to the outer render process HTML `window.parent.document` (or to `window.top.document`) like this:

```html
<li><a href="javascript:window.parent.document.dispatchEvent(new CustomEvent('eventFromIframePage', { detail: { foo: 'bar' } }));">Send custom event to window.parent (render process)</a></li>
```

and receive it in the render process like this:

```javascript
// In electron render process html, listen for possible custom events from iframe pages
// You could in turn talk to the electron main process from here, thus offering a way for
// flask pages to talk to both the render process and the main process.
window.document.addEventListener('eventFromIframePage', handleEvent, false)
function handleEvent(e) {
    console.log(e.detail)
    alert('electron render process html received event from iframe page.')
}
```

> The demo page `/hello-vue`, in the generated project, demonstrates this communication.

### Optional Render -> Main

Once the event reaches the render process, you can then contact the main electron process (`src/index.js` using the official Electron inter-process techniques, viz. sending a second event and possibly passing the payload of the first event onto the second event.

```javascript
// flask page in render process iframe -> render process -> main process
window.document.addEventListener('eventFromIframePageToMain', handleEventAndPassItOn, false)
function handleEventAndPassItOn(e) {
    console.log(window.ipcRenderer.sendSync('synchronous-message', e.detail)) 
}
```

- stage 1 receive event from flask page in iframe
- stage 2 send second event to main process, passing on the payload

> Tip: Look in the terminal console for proof that the main process got the event and its payload

Of course you can do electron inter-process communication using [asynchronous events](https://www.tutorialspoint.com/electron/electron_inter_process_communication.htm), too.

## Main -> Flask

Intercepting events from the main process is important because e.g. native Electron menu items trigger events in the main process.

We should use standard Electron inter-process communication techniques to send a message from the main -> render process, if we need to.

There are various scenarious:
- The Electron main process javascript calls a flask endpoint using ajax and receives a result, which can then be relayed to the render process.
- The Electron render process javascript calls a flask endpoint.
- The Electron render process javascript can load any flask page into the iframe. It can also load in any arbitrary html into the iframe.
- The flask page can call a flask endpoint using ajax and update its own DOM if necessary.

### Example 1

A challenging and interesting scenario might be - an electron menu item which causes the state of a flask page to change.

Simply send an event `main -> render`, then from the render process send a custom event to the iframe like this:

```javascript
let event = new CustomEvent('eventFromRenderProcess', { detail: { foo: 'bar2' } })
document.querySelector('iframe.flask-pages').contentDocument.dispatchEvent(event)
```

and receive it in the flask javascript like this

```javascript
// Example of listening for events from render process html
window.document.addEventListener('eventFromRenderProcess', handleEvent, false)
function handleEvent(e) {
    console.log(e.detail)
    alert('iframe FLASK page received event from electron render process')
}
```

## Flask server -> Electron?

Whilst anyone (electron render process, electron main process, flask rendered page) can talk to the flask server just by calling an endpoint, can the flask server talk to any of these electron processes? 

No, it can only reply to incoming requests - unless perhaps you set up a socket or other such two way mechanism - yet to be explored. Its probably out of scope of this project since its just regular client server programming - the world is your oyster in terms of what you want to do.

# Debugging your generated project

You can debug both electron and flask in the vscode debugger.

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

### Notes on electron auto launching flask

The main idea of this electron-flask project is the idea that electron auto launches a flask server when it runs.

However when launching electron via vscode, you must launch the flask independently - the electron app will not launch flask. This is deliberate due to our custom environment variable `ELECTRON_FLASK_DONT_LAUNCH_FLASK` set to `"1"` and the electron main process `index.js` looking for this environment variable. The reasoning for not launching flask automatically when debugging electron is:
- The electron launcher via `launch.json` cannot activate the correct python virtual environment before launching electron, so running the flask process is going to fail anyway. 
  - There may be a way around this via extr entries in the above `launch.json` but these have not yet been discovered?  
  - Incidentally launching the correct python virtual environment shell for the electron process isn't a problem in the `bin/runelectron` script because it does `source venv/bin/activate && npm start` which does indeed launch the correct venv, so that when electron calls the shell to launch flask, the venv is the correct one.
- You are trying to debug electron so you probably want to launch flask in a debugging mode too, in which case you are probably going to launching flask separately anyway, using a vscode launch config (see next section for info on this).
- You can easily launch flask separately on the command line with `runflask`

> P.S. If you *really* want to auto launch flask from electron when launching electron in debugging mode, you could potentially build and then launch the flask executable from electron instead of launching the flask python file. This would run with its own Python environment and thus run correctly. To do this you would need built a flask executable using the script `buildflask-exe` then copy the resulting `dist/app` into `node_modules/electron/dist/Electron.app/Contents/Resources/app/dist/app` so that the the `guessPackaged()` function in `src/index.js` gets fooled into thinking we are running in packaged mode. Remember to delete the `app` from that location afterwards.

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

