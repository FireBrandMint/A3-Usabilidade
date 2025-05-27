const path = require('path')

function foreachHtmlWithClass (event, class_name, callback)
{
    var elements = document.getElementsByClassName(class_name);
    for(var i = 0; i < elements.length; ++i)
    {
        callback(elements[i]);
    }

    event.returnValue = 'success';
}

function get_appdata()
{
    switch(process.platform)
    {
        case 'darwin': {
            return path.join(process.env.HOME, 'Library', 'Application Support');
        }
        case 'win32': {
            return process.env.APPDATA;
        }
        case 'win64': {
            return process.env.APPDATA;
        }
        case 'linux': {
            return process.env.HOME;
        }
    }
}

exports.get_appdata = get_appdata;