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
        fs.writeFile(this.data_path, JSON.stringify(this.data), (err) => {
            if(err)
            {
                console.error(err);
                throw err;
            }

            console.log("Saved data successfully.");
        });
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
            console.error(err);
        }
    }

    test(event, ...args)
    {
        console.log("Test signal received.");
    }
}

exports.commands = new Commands();