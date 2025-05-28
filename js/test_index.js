const electron = require('electron');
const ipc = electron.ipcRenderer;

console.log("lol");

createHtmlEvents();

ipc.send("data.test");

function createHtmlEvents()
{
    foreachHtmlWithClass("clickable_test", (html_element) =>
    {
        html_element.addEventListener("click", () => { console.log("Clicked.") } );
    });
}


function foreachHtmlWithClass (class_name, callback)
{
    var elements = document.getElementsByClassName(class_name);
    for(var i = 0; i < elements.length; ++i)
    {
        callback(elements[i]);
    }
}