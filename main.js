const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const ipc = electron.ipcMain;
const data_manager = require('./js/data_manager');

let win;

const data_commands = data_manager.commands;
const data_commands_prototype = Object.getPrototypeOf(data_commands);

beforeReady();

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

//Initialization functions

/**
 * @param {Function} fu
 */
function beforeReady()
{
    let func_names = Object.getOwnPropertyNames(data_commands_prototype).filter((val) => val != "constructor");


    console.log("hello?");
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
            app.quit();
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
function pushTimeNotification(data)
{
    
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
        slashes: true
    } ));

    win.on('closed', () => {
        win = null
    });

    //win.removeMenu();
    win.webContents.openDevTools();
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