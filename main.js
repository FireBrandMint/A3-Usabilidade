console.log("EZ");

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

let win;

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

function onReady()
{
    createWindow();
}

function createWindow() {
    win = new BrowserWindow();
    win.removeMenu();
    win.loadURL(url.format( {
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    } ));

    win.on('closed', () => {
        win = null
    });
}