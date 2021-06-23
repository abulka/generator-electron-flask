const { app, BrowserWindow } = require('electron');
const path = require('path');
const { setMainWindow, getMainWindow, closeMainWindow } = require('./boot-flask.js');
const { runFlask, checkFlask, killFlask } = require('./boot-flask.js');

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


const createWindow = () => {
  if (process.env.ELECTRON_FLASK_DONT_LAUNCH_FLASK == "1") {
    console.log('Electron app is NOT auto launching flask process - assuming you have launched it independently, for debugging purposes.')
  }
  else {
    runFlask()
  }
  checkFlask()

  // Create the browser window.
  const _mainWindow = new BrowserWindow({
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
  _mainWindow.loadFile(path.join(__dirname, 'index.html'));

  <% if (openDevTools) { %>
  // Open the DevTools.
  _mainWindow.webContents.openDevTools();
  <% } %>

  setMainWindow(_mainWindow) 
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
  if (getMainWindow()) {
    event.preventDefault();  // stop the quit
    closeMainWindow();  // close window, which will then trigger 'window-all-closed'
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  killFlask(app)
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
