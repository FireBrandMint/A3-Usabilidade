const util = require("./js/util");
const fs = require("fs");
const path = require("path");

class Commands
{
    constructor()
    {
        this.data = {
            routine: [],
            reminder: [],
            stopwatch: null
        };
        this.folder_path = path.join(util.get_appdata(), "FBMClock");
        this.data_path = path.join(util.get_appdata(), "FBMClock", "data.json");
        this.load();
    }

    //All the functions below can be accessed in html scripts
    //by sending an ipc call called
    //data.<function>

    /**
     * @param {Electron.IpcMain} event
     * @param {any[]} args
     */
    save(event, ...args)
    {
        if(!fs.existsSync(this.folder_path))
            fs.mkdirSync(this.folder_path);
        try
        {
            fs.writeFileSync(this.data_path, JSON.stringify(this.data));
            console.log("Saved data successfully.");
        }
        catch (err)
        {
            console.error(err);
        }
    }

    /**
     * @param {Electron.IpcMain} event
     * @param {any[]} args
     */
    load(event, ...args)
    {
        try
        {
            let json_data = fs.readFileSync(this.data_path);
            this.data = JSON.parse(json_data);
        }
        catch (err)
        {
            if(err.message.startsWith("ENOENT: no such file or directory"))
            {
                this.save();
                return;
            }

            console.log(err);
        }
    }

    test(event, ...args)
    {
        console.log("Test signal received.");
    }
}

exports.commands = new Commands();