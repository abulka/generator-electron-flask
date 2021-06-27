const { app, BrowserWindow } = require('electron');
const {ipcMain} = require('electron')
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
  checkFlask(cb_post_flask)  // wait for flask server, then create window and load initial 'src/index.html'

    function cb_post_flask() {
    // Once flask is running, load the main window content, which usually loads a flask page,
    // which is why we need to wait for flask to be running.

    // Create the browser window.
    const _mainWindow = new BrowserWindow({
      width: 1000,
      height: 800,

      webPreferences: {

        // Turn off webSecurity to allow events from iframe flask pages to get into render process html
        // there may be other solutions e.g. https://stackoverflow.com/questions/25098021/securityerror-blocked-a-frame-with-origin-from-accessing-a-cross-origin-frame
        // whereby this can be kept true.
        webSecurity: false,
  
        // Allow electron render process (which is the browser window
        // src/index.html & javascript launched by the main process src/index.js)
        // to communicate with the electron main process (which is src/index.js).
        // The solution of turning on HTMLnodeIntegration: true, is a security
        // risk, and also breaks the ability to use <script> tags in
        // src/index.html - the correct solution is to use this preload trick
        // https://stackoverflow.com/questions/54544519/electron-require-is-not-defined
        // This solution needs contextIsolation: false so that window.ipcRenderer
        // and any other propery of 'window' that you create in preload.js sticks
        // and properly exists in the render process's 'window'. If you want to keep
        // contextIsolation: true then you'll need to use a more complex
        // window.postMessage variant of this solution - see above stackoverflow
        // url.
        contextIsolation: false,
        preload: `${__dirname}/preload.js`
      }

    });

    // Load the initial page of the app. 
    _mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    <% if (openDevTools) { %>
    // Open the DevTools.
    _mainWindow.webContents.openDevTools();
    <% } %>
    
    // let boot flask logic know about mainWindow to assist with proper quit
    setMainWindow(_mainWindow) 
  }

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

// Event Communication

// Event handler for synchronous incoming messages
ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) 

  // Synchronous event emmision
  event.returnValue = 'sync pong'
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
