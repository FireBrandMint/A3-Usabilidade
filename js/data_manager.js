const util = require("./util");
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
        //each entry has: type, title, description, timestamp
        this.day_scheduled_notifications = [];
        this.stopwatch_time = null;
        this.stopwatch_pause = null;
        this.folder_path = path.join(util.get_appdata(), "FBMClock");
        this.data_path = path.join(util.get_appdata(), "FBMClock", "data.json");
        this.runtime_version = 0;
        this.saved_version = 0;
    }

    eachSecond()
    {
        //log for heartbeat
        //console.log("Ba-dump.");

        let now = Date.now();

        const today_notifs = this.day_scheduled_notifications;

        let to_remove = [];

        for(const i in today_notifs)
        {
            let curr = today_notifs[i];

            if(now <= curr.timestamp)
            {
                switch (curr.type)
                {
                    case "routine":
                        break;
                    case "reminder":
                        break;
                }

                to_remove.push(i);
                this.on_notification(curr);
            }
        }

        for(i = to_remove.length - 1; i >= 0; i--)
        {
            today_notifs.splice(to_remove[i], 1);
        }
    }

    initialize()
    {
        this.calculate_scheduled();
    }

    /**
     * @param {Function} on_notification 
     */
    initializeLoop(on_notification)
    {
        this.on_notification = on_notification;
        setInterval(commands.eachSecond, 1000);
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
    save(event)
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
    load(event)
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

    /**
     * @param {Electron.IpcMain} event
    */
    create_routine(event, title, description, week_day, hour, minute)
    {
        let now_date = new Date(Date.now());

        if(check_args([week_day, hour, minute], "number", "number", "number"))
        {
            throw new Error("Routine needs to have 2 args: hour and day of the week. (1 to 7 starting at sunday)");
        }

        this.data.routine.push({ title: title, description: description, week_day: week_day, hour: hour, minute: minute });

        if(now_date.getDay() === week_day && now_date.getHours() <= hour)
        {
            if(now_date.getHours() !== hour || now_date.getMinutes() <= minute)
            {
                now_date.setHours(hour, minute);
                this.day_scheduled_notifications.push({ type: "routine", title: title, description: description, timestamp: now_date.getTime()});
            }
        }

        this.increment_version();
    }

    create_reminder(event, title, description, year, month, day, hour, minute)
    {
        var when = new Date(year, month - 1, day, hour, minute);

        this.data.reminder.push({ title: title, description: description, when: when.getTime() })

        let now = Date.now();

        if(when.getTime() + 86400000 >= now)
        {
            this.day_scheduled_notifications.push({ type: "reminder", title: title, description: description, timestamp: when.getTime()});
        }

        this.increment_version();
    }

    /**
     * @param {Electron.IpcMain} event
    */
    create_stopwatch(event)
    {
        //this.stopwatch_time = Date.now() + hours * 3600000 + minutes * 60000 + seconds * 1000;
        this.stopwatch_time = Date.now();
    }

    /**
     * @param {Electron.IpcMain} event
    */
    get_stopwatch(event, hours, minutes, seconds)
    {
        if(this.stopwatch_time === null)
            return null;

        //https://www.electronjs.org/docs/latest/api/ipc-renderer
        return { hours: elapsed / 3600000, minutes: (elapsed / 60000) % 60, seconds: (elapsed / 1000) % 60 };
    }

    /**
     * @param {Electron.IpcMain} event
    */
    stop_stopwatch(event)
    {
        if(this.stopwatch_time === null)
            return null;

        let now = Date.now();

        let elapsed = now - this.stopwatch_time;

        if(this.stopwatch_pause !== null)
        {
            elapsed -= now - this.stopwatch_pause;
        }

        this.stopwatch_time = null;
        this.stopwatch_time = null;

        return { hours: elapsed / 3600000, minutes: (elapsed / 60000) % 60, seconds: (elapsed / 1000) % 60 };
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

const commands = new Commands();

commands.initialize();
exports.commands = commands;