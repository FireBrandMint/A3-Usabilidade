const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const protocol = electron.protocol;
const ipc = electron.ipcMain;
const data_manager = require('./js/data_manager');

let win;

const data_commands = data_manager.commands;
const data_commands_prototype = Object.getPrototypeOf(data_commands);

beforeReady();

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

/**
 * @type {Electron.BrowserWindow}
 */
let mainWindow;

//Initialization functions

/**
 * @param {Function} fu
 */
function beforeReady()
{
    protocol.registerSchemesAsPrivileged

    let func_names = Object.getOwnPropertyNames(data_commands_prototype).filter((val) => val != "constructor");

    for(var i in func_names)
    {
        const func_name = func_names[i];
        let curr = data_commands[func_name];

        if((typeof curr).toString() == "function" && i !== undefined)
        {
            let f = curr;
            const f_param_names = get_param_names(f);
            
            if(f_param_names.length < 1 || f_param_names[0] !== "event")
            {
                continue;
            }

            console.log("Registered command called data." + f.name);
            ipc.on("data." + f.name, f.bind(data_commands));
        }
    }

    console.log(data_commands.data.routine);

    app.on('ready', onReady);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin')
        {
            app.quit();
            data_commands.save();
        }
    });

    app.on('activate', () => {
        if(win === null) {
            createWindow();
        }
    });
}

function onReady()
{
    data_commands.initializeLoop(pushTimeNotification);
    createWindow();
    //createHtmlEvents();
}

//Pushes alarm notification to the UI.
async function pushTimeNotification(data)
{
    if(data.type === "reminder")
        mainWindow.webContents.send("reminder_updated");

    console.log("notif should appear");

    win = new BrowserWindow({
    width: 600,
    height: 525,
    parent: mainWindow,
    modal: true,
    webPreferences: {
        //preload: path.join(__dirname, 'js', 'notutil.js'),
        nodeIntegration: true,
        contextIsolation: false,
        plugins: true,
        parent: mainWindow
    }
    });

    win.setAlwaysOnTop(true);

    //win.openDevTools();

    await win.loadURL(url.format( {
        pathname: path.join(__dirname, 'web-stuff', 'notification.html'),
        protocol: 'file',
        slashes: true
    }))

    win.webContents.send('receive-data', data, path.join(get_resources_path(), "default_alarm.mp3"));
}

//Functions that are called elsewhere

function createWindow() {
    win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        //preload: path.join(__dirname, 'js', 'notutil.js'),
        nodeIntegration: true,
        contextIsolation: false,
        plugins: true
    }
    });
    
    win.loadURL(url.format( {
        pathname: path.join(__dirname, 'web-stuff', 'homepage.html'),
        protocol: 'file',
        slashes: true,
        backgroundThrottling: false
    } ));

    win.on('closed', () => {
        win = null
    });

    //win.removeMenu();
    //win.webContents.openDevTools();
    mainWindow = win;
}

/**
 * 
 * @param {Function} func 
 * @returns 
 */
function get_param_names(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '').replace(' ', '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).split(',');
  //.match(ARGUMENT_NAMES)
  if(result === null)
     result = [];
  return result;
}

function get_resources_path()
{
    
    return path.join(__dirname, 'asset');
}