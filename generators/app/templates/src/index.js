const { app, BrowserWindow } = require('electron');
const path = require('path');
const request = require('request');

<% if (killFlask) { %>
const kill  = require('tree-kill');
<% } %>
<% if (reportVersions) { %>
const os = require('os');
<% } %>
<% if (reportCwd) { %>
const sh = require("shelljs");  // https://github.com/shelljs/shelljs - npm install shelljs --save 
<% } %>
<% if (electronLog) { %>
const log = require('electron-log');  // https://www.npmjs.com/package/electron-log - npm i electron-log --save
<% } %>
<% if (reportVersions) { %>
// Report node, chrome version and platform info. See
// https://www.npmjs.com/package/electron-releases to map electron versions to
// node versions.
console.log('NODE', process.version, 
            'CHROME', process.versions.chrome, 
            'ELECTRON', process.versions.electron, 
            'PLATFORM', process.platform,
            'ARCHITECTURE', os.arch());
<% } %>
<% if (reportCwd) { %>
// Report current working directory. cwd seems to be the electron project root
// when app launched via terminal or '/' when launched via double click via
// finder/nautilus/windows explorer.
console.log('electron cwd is', sh.pwd().stdout);
<% } %>  

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

<% if (launchFlask) { %>
// Figure out the Resources/ dir inside the electron app bundle.
let resourcesPath = process.resourcesPath;

// Figure out the Python executable path, based on the name 'app.py' built by
// Pyinstaller.  Note in the path below, the first 'app' refers to the path
// inside the Electron executable bundle, and the second 'app' is the name of
// the Python executable file.
let pythonExePath = path.join(process.resourcesPath, 'app', 'dist', process.platform === "win32" ? 'app.exe' : 'app');

// Record the process id of the Python flask child process so that we can kill it later.
let subpy;

const guessPackaged = () => {
  return require('fs').existsSync(pythonExePath)
}
log.info('pythonExePath', pythonExePath, 'packaged mode?', guessPackaged())

function checkFlask() {
  request('http://localhost:5000/', { json: true }, (err, res, body) => {
    if (err)
      console.log(`Could not communicate with flask server ${err}`)
    else if (res.statusCode != 200)
      console.log(`Could not communicate with flask server ${res.statusCode} ${body}`)
    else
      console.log('Communication with flask server is OK 🎉')
  });
}

function runFlask() {
  // Launch Flask as a child process, wires up stdout and stderr so we can see them
  // in the electron main process console.  Remember Python needs to flush stdout

  // Actually no need to pass options and change cwd since that's all taken care of INTERNALLY inside the 
  // python app - it has the templates dir internally, which is unzipped into /tmp
  options = {}
  // options = {cwd: app_src_path }
  
  if (guessPackaged())
    subpy = require('child_process').spawn(pythonExePath, [], options);  // prod
  else
    subpy = require('child_process').spawn('python', [path.join(__dirname, '..', 'src-flask-server', 'app.py')]);  // dev

  subpy.stdout.on('data', function (data) {
    let msg = `PYTHON stdout: ${data.toString('utf8')}`
    msg = msg.replace(/\n+$/, "")
    console.log(msg);
  });
  subpy.stderr.on('data', (data) => {
    let msg = `PYTHON stderr: ${data}`
    msg = msg.replace(/\n+$/, "")
    console.log(msg); // when error
  });
}
<% } %>  

let mainWindow = null;

const createWindow = () => {
  <% if (launchFlask) { %>
    if (process.env.ELECTRON_FLASK_DONT_LAUNCH_FLASK == "1") {
      console.log('Electron app is NOT auto launching flask process - assuming you have launched it independently, for debugging purposes.')
    }
    else {
      runFlask()
      console.log('Flask process id', subpy.pid)
    }
  <% } %>  
  checkFlask()

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,

    // Turn off to allow events from iframe flask pages to get into render process html
    // there may be other solutions e.g. https://stackoverflow.com/questions/25098021/securityerror-blocked-a-frame-with-origin-from-accessing-a-cross-origin-frame
    // whereby this can be kept true.
    webPreferences: {
      webSecurity: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  <% if (openDevTools) { %>
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  <% } %>  
};

// Disable iframe navigation blocked warnings, possibly there is a better solution.
// https://stackoverflow.com/questions/55898000/blocked-a-frame-with-origin-file-from-accessing-a-cross-origin-frame
app.commandLine.appendSwitch('disable-site-isolation-trials');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Hitting File/Quit bypasses closing of the window and comes straight here, so 
// detect this, wait for main window and python to close, then this quit handler will be 
// retriggered by 'window-all-closed' calling app.quit() again
app.on("before-quit", function (event) {
  if (mainWindow) {
    event.preventDefault();  // stop the quit
    mainWindow.close();  // close window, which will then trigger 'window-all-closed'
  }
});

/*
normal quit
  window-all-closed
  before quit
file quit 
  before quit
*/
function killFlask() {
  <% if (launchFlask && killFlask) { %>

    if (subpy) {
    
      console.log('kill', subpy.pid)
      kill(subpy.pid, 'SIGKILL', function(err) {
        console.log('done killing flask')
        
        // App quit() logic
        <% if (macFullyQuit) { %>
        mainWindow = null  
        app.quit();
        <% } else { %>  
        if (process.platform !== 'darwin') {
          mainWindow = null  
          app.quit();
        }
        <% } %>  
          
      });
  
    }
    else {
        // App quit() logic
        <% if (macFullyQuit) { %>
        mainWindow = null  
        app.quit();
        <% } else { %>  
        if (process.platform !== 'darwin') {
          mainWindow = null  
          app.quit();
        }
        <% } %>  
    }
  
    <% } else { %>  
  
        // App quit() logic
        <% if (macFullyQuit) { %>
        mainWindow = null  
        app.quit();
        <% } else { %>  
        if (process.platform !== 'darwin') {
          mainWindow = null  
          app.quit();
        }
        <% } %>  
  
    <% } %>    
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  killFlask()
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
