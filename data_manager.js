const util = require("./js/util");
const fs = require("fs");
const path = require("path");

//let ndate = Date.now();
//the following produced the same number
//console.log(ndate)
//console.log((new Date(ndate)).getTime())

/**
 * 
 * @param {any[]} args 
 * @param  {any[]} argtypes 
 */
function check_args(args, ...argtypes)
{
    if(args === null || args === undefined || args.length != argtypes.length)
        return true;

    let result = false;

    for(const i in argtypes)
    {
        if(typeof args[i] !== argtypes[i])
        {
            result = true;
            break;
        }
    }

    return result;
}

class Commands
{
    constructor()
    {
        this.data = {
            //Not an actual date, instead, a number
            //representing it, simply do
            //new Date(this.last_login)
            //to get the date
            last_login: Date.now(),
            //periodic alarm for days of the week
            //element = object {  }
            routine: [],
            reminder: []
        };
        //each entry has: type, timestamp
        this.day_scheduled_notifications = [];
        this.stopwatch_time = null;
        this.folder_path = path.join(util.get_appdata(), "FBMClock");
        this.data_path = path.join(util.get_appdata(), "FBMClock", "data.json");
        this.runtime_version = 0;
        this.saved_version = 0;
    }

    initialize()
    {
        this.calculate_scheduled();
    }

    calculate_scheduled(now)
    {
        if(now === undefined || now === null) now = Date.now();

        this.day_scheduled_notifications.length = 0;

        const date_now = new Date(now);

        const routine = this.data.routine;
        for(const i in routine)
        {
            const r_element = routine[i];
            if(r_element.week_day === date_now.getDay() && r_element.hour >= date_now.getHours())
            {
                if(r_element.hour !== date_now.getHours() || r_element.minute >= date_now.getMinutes())
                {
                    let notif = new Date(now);
                    notif.setHours(r_element.hour, r_element.minute);

                    this.day_scheduled_notifications.push({ type: "routine", timestamp: notif.getTime() });
                }
            }
        }
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
            this.runtime_version = this.saved_version;
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

    create_routine(event, week_day, hour, minute)
    {
        let now_date = new Date(Date.now());

        if(check_args([week_day, hour, minute], "number", "number", "number"))
        {
            throw new Error("Routine needs to have 2 args: hour and day of the week. (1 to 7 starting at sunday)");
        }

        this.data.routine.push({ week_day: week_day, hour: hour, minute: minute });

        if(now_date.getDay() === week_day && now_date.getHours() <= hour)
        {
            if(now_date.getHours() !== hour || now_date.getMinutes() <= minute)
            {
                now_date.setHours(hour, minute);
                this.day_scheduled_notifications.push({ type: "routine", timestamp: now_date.getTime()});
            }
        }

        this.increment_version();
    }

    create_stopwatch(event, hours, minutes, seconds)
    {
        this.stopwatch_time = Date.now() + hours * 3600000 + minutes * 60000 + seconds * 1000;
    }

    test(event, ...args)
    {
        console.log("Test signal received.");
    }

    increment_version()
    {
        ++this.runtime_version;
    }
}

exports.commands = new Commands();
exports.commands.initialize();