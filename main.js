const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");
const ipc = electron.ipcMain;
const util = require('./js/util');

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

for(var i in util)
{
    if((typeof util[i]).toString() == "function")
    {
        let f = util[i];
        console.log(f.name);
        ipc.on(f.name, f);
    }
}