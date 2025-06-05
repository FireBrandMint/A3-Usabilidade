const util = require("./util");
const fs = require("fs");
const path = require("path");
const uuidLib = require("uuid");

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
        this.generate_id = uuidLib.v4;
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

            if(now >= curr.timestamp)
            {
                switch (curr.type)
                {
                    case "routine":
                        break;
                    case "reminder":
                        this.remove_reminder(null, curr.id);
                        break;
                }

                this.increment_version();
                to_remove.push(i);
                this.push_notification(curr);
            }
        }

        for(let i = to_remove.length - 1; i >= 0; i--)
        {
            today_notifs.splice(to_remove[i], 1);
        }

        
    }

    eachHalfMinute()
    {
        if(this.saved_version != this.runtime_version)
        {
            this.save();
        }
    }

    initialize()
    {
        this.load(null);
        this.calculate_scheduled();
    }

    /**
     * @param {Function} push_notification 
     */
    initializeLoop(push_notification)
    {
        this.push_notification = push_notification;
        setInterval(commands.eachSecond.bind(this), 1000);
        setInterval(this.eachHalfMinute.bind(this), 30000)
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
            const week_day = r_element.week_day;

            let is_date = false;

            for(const i2 in week_day)
            {
                if(date_now.getDay() === week_day[i2])
                {
                    is_date = true;
                    break;
                }
            }

            if(
                is_date && date_now.getHours() <= r_element.hour && (date_now.getHours() !== r_element.hour || date_now.getMinutes() <= r_element.minute)
                //&& r_element.hour >= date_now.getHours()
            )
            {
                //if(r_element.hour !== date_now.getHours() || r_element.minute >= date_now.getMinutes())
                //{
                    let notif = new Date(now);
                    notif.setHours(r_element.hour, r_element.minute);
                    this.day_scheduled_notifications.push({ type: "routine", title: r_element.title, description: r_element.description, timestamp: notif.getTime(), id: r_element.id });
                //}
            }
        }

        let today_end = new Date(now);
        today_end.setHours(23, 59, 59);

        const reminder = this.data.reminder;

        for(const i in reminder)
        {
            const r_element = reminder[i];

            if(r_element.when <= today_end.getTime())
                 this.day_scheduled_notifications.push({ type: "reminder", title: r_element.title, description: r_element.description, timestamp: r_element.when, id: r_element.id });
        }
    }

    //All the functions below can be accessed in html scripts
    //by sending an ipc call called
    //data.<function>

    /**
     *
     * @param {Electron.IpcMainEvent} event
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
     *
     * @param {Electron.IpcMainEvent} event
     */
    load(event)
    {
        try
        {
            let json_data = fs.readFileSync(this.data_path);
            this.data = JSON.parse(json_data);

            const now = new Date(Date.now());
            const reminder = this.data.reminder;
            const routine = this.data.routine;

            //debug code, remove on release
            //if(reminder.length == 0)
            //    reminder.push({ title: "startthing", description: "description here", when: now.getTime() + 300000, id: this.generate_id() });

            //if(routine.length == 0)
            //    routine.push({ title: "debug title", description: "desc here", week_day: [now.getDay()], hour: now.getHours() + 2, minute: now.getMinutes(), id: this.generate_id() });
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
     * @param {Electron.IpcMainEvent} event
    */
    create_routine(event, title, description, week_days, hour, minute)
    {
        let now_date = new Date(Date.now());

        const id = this.generate_id();

        this.data.routine.push({ title: title, description: description, week_day: week_days, hour: hour, minute: minute, id: id });
        console.log(this.data.routine);

        let is_date = false;

        console.log(now_date.getDay())

        for(const i in week_days)
        {
            if(now_date.getDay() === week_days[i])
            {
                is_date = true;
                break;
            }
        }

        if(is_date && now_date.getHours() <= hour)
        {
            if(now_date.getHours() !== hour || now_date.getMinutes() <= minute)
            {
                console.log(hour + ":" + minute);
                let then = new Date(now_date.getTime());
                then.setHours(hour, minute);

                console.log(then.getHours() + ":" + then.getMinutes());

                console.log("pushed the notif");
                this.day_scheduled_notifications.push({ type: "routine", title: title, description: description, timestamp: then.getTime(), id: id });
            }
        }

        this.increment_version();

        event.returnValue = null;
    }

    create_reminder(event, title, description, year, month, day, hour, minute)
    {
        var when = new Date(year, month - 1, day, hour, minute);

        console.log(when.toLocaleString());

        const id = this.generate_id();

        this.data.reminder.push({ title: title, description: description, when: when.getTime(), id: id })

        let now = Date.now();

        if(when.getTime() + 86400000 >= now || when.getTime() < now)
        {
            this.day_scheduled_notifications.push({ type: "reminder", title: title, description: description, timestamp: when.getTime(), id: id });
        }

        this.increment_version();
    }

    /**
     * @param {Electron.IpcMainEvent} event
    */
    create_stopwatch(event, keep_pause)
    {
        //this.stopwatch_time = Date.now() + hours * 3600000 + minutes * 60000 + seconds * 1000;
        const now = Date.now();
        this.stopwatch_time = now;

        if(keep_pause !== undefined && keep_pause && this.stopwatch_pause !== null)
        {
            this.stopwatch_pause = now;
            event.returnValue = null;
            return;
        }

        this.stopwatch_pause = null;

        event.returnValue = null;
    }

    /**
     * @param {Electron.IpcMainEvent} event
    */
    get_routines(event)
    {
        //console.log(this.data.routine);
        event.returnValue = this.data.routine;
        return;
    }

    /**
     * @param {Electron.IpcMainEvent} event
    */
    get_reminders(event)
    {
        event.returnValue = this.data.reminder;
        return;
    }

    remove_routine(event, uuid)
    {
        const routine = this.data.routine;

        let success = false;

        let removed = null;

        for(const i in routine)
        {
            const curr = routine[i];
            if(curr.id === uuid)
            {
                removed = curr;
                routine.splice(i, 1);
                this.increment_version();
                success = true;
                break;
            }
        }

        if(success)
        {
            const scheduled_today = this.day_scheduled_notifications;

            for(const i in scheduled_today.length)
            {
                if(scheduled_today[i].id === uuid)
                {
                    scheduled_today.splice(i, 1);
                    break;
                }
            }
        }

        console.log("removed_routine = " + success);
        event.returnValue = removed;
    }

    remove_reminder(event, uuid)
    {
        const reminder = this.data.reminder;

        let success = false;

        let removed = null;

        for(const i in reminder)
        {
            const curr = reminder[i];
            if(curr.id === uuid)
            {
                removed = curr;
                reminder.splice(i, 1);
                console.log("did it.");
                this.increment_version();
                success = true;
                break;
            }
        }

        if(success)
        {
            const scheduled_today = this.day_scheduled_notifications;

            for(const i in scheduled_today.length)
            {
                if(scheduled_today[i].id === uuid)
                {
                    scheduled_today.splice(i, 1);
                    break;
                }
            }
        }

        console.log("removed_routine = " + success);
        if (event !== undefined && event !== null) event.returnValue = removed;
    }

    /**
     * @param {Electron.IpcMain} event
    */
    toggle_pause_stopwatch(event)
    {
        if(this.stopwatch_time === null)
            return;

        const now = Date.now();

        if(this.stopwatch_pause === null)
        {
            this.stopwatch_pause = now;
            return;
        }

        this.stopwatch_time += now - this.stopwatch_pause;
        this.stopwatch_pause = null;
    }

    /**
     * @param {Electron.IpcMain} event
    */
    get_stopwatch(event)
    {
        if(this.stopwatch_time === null)
        {
            event.returnValue = null;
            return;
        }

        const now = Date.now();

        let elapsed = now - this.stopwatch_time;

        if(this.stopwatch_pause !== null)
        {
            elapsed -= now - this.stopwatch_pause;
        }

        //https://www.electronjs.org/docs/latest/api/ipc-renderer
        event.returnValue = elapsed;
        return;
    }

    /**
     * @param {Electron.IpcMainEvent} event
    */
    stop_stopwatch(event)
    {
        if(this.stopwatch_time === null)
        {
            event.returnValue = null;
            return;
        }

        let now = Date.now();

        let elapsed = now - this.stopwatch_time;

        if(this.stopwatch_pause !== null)
        {
            elapsed -= now - this.stopwatch_pause;
        }

        this.stopwatch_time = null;
        this.stopwatch_time = null;

        //{ hours: elapsed / 3600000, minutes: (elapsed / 60000) % 60, seconds: (elapsed / 1000) % 60 }
        event.returnValue = elapsed;
        return;
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