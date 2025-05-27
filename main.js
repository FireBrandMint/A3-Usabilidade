const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const ipc = electron.ipcMain;
const data_manager = require('./data_manager');

let win;

beforeReady();

//Initialization functions

function beforeReady()
{
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
    createWindow();
    //createHtmlEvents();
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
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    } ));

    win.on('closed', () => {
        win = null
    });

    //win.removeMenu();
    win.webContents.openDevTools();
}

const data_commands = data_manager.commands;
const data_commands_prototype = Object.getPrototypeOf(data_commands);

let func_names = Object.getOwnPropertyNames(data_commands_prototype).filter((val) => val != "constructor");

for(var i in func_names)
{
    let curr = data_commands[func_names[i]];
    if((typeof curr).toString() == "function" && i !== undefined)
    {
        let f = curr;
        console.log("Registered command called data." + f.name);
        ipc.on("data." + f.name, f);
    }
}