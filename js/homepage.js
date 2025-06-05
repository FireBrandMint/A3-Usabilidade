const electron = require('electron');
const ipc = electron.ipcRenderer;

let editing_routine = null;
let editing_reminder = null;

let routine = [];
let reminder = [];

const views = document.querySelectorAll('.view');

let currentView = "dashboard";

let editingObj = null;

let onViewOpen = new Map();
onViewOpen.set("rotinas",
    /**
    * @param {Element} view
    */
    (view) => {
        getRoutines();
        const htmlroutine_list = view.getElementsByClassName("rotinas-list")[0];
        clearChildren(htmlroutine_list);

        for(const i in routine)
        {
            const curr = routine[i];

            const li = document.createElement("li");
            const append_span = document.createElement("span");
            let titlevisible = curr.title + " (";
            /**
             * @type {string[]}
             */
            const week_day = curr.week_day;
            for(const i in week_day)
            {
                titlevisible += toWeekDay(week_day[i]);
                if(i != week_day.length - 1)
                    titlevisible += ", ";
            }
            titlevisible += ")";
            append_span.textContent = titlevisible;
            //const append_small = document.createElement("small");
            //append_small.textContent = toWeekDay(week_day);
            //append_span.appendChild(append_small);
            const span = document.createElement('span');
            const btn_edit = document.createElement('button');
            btn_edit.className = "rotina-edit-btn";
            btn_edit.textContent = "✏️ Editar";
            btn_edit.addEventListener('click', e => {
                e.preventDefault();

                onRoutineEdit(i);
            });
            span.appendChild(btn_edit);
            const btn_delete = document.createElement('button');
            btn_delete.className = "rotina-delete-btn";
            btn_delete.textContent = "❌ Excluir";
            btn_delete.addEventListener('click', e => {
                e.preventDefault();

                onRoutineDelete(i);
            });
            span.appendChild(btn_delete);
            li.appendChild(append_span);
            li.appendChild(span);
            htmlroutine_list.appendChild(li);
        }
});

onViewOpen.set("lembretes",
    /**
    * @param {Element} view
    */
    (view) => {
        //console.log("hi");
        getReminders();
        const htmlreminder_list = view.getElementsByClassName("lembretes-list")[0];

        htmlreminder_list.innerHTML = "";

        for(const i in reminder)
        {
            const curr = reminder[i];
            const time = new Date(curr.when);
            const li = document.createElement('li');
            li.innerHTML = "<span>" + curr.title + "<small> (" + time.toLocaleDateString() + ' ' + time.getHours() + ':' + time.getMinutes() + ")</small></span>";
            //<span><button class=\"lembrete-edit-btn\">✏️ Editar</button><button class=\"lembrete-delete-btn\">❌ Excluir</button></span>
            const span = document.createElement('span');
            const btn_edit = document.createElement('button');
            btn_edit.className = "lembrete-edit-btn";
            btn_edit.textContent = "✏️ Editar";
            btn_edit.addEventListener('click', e => {
                e.preventDefault();

                onReminderEdit(i);
            });
            span.appendChild(btn_edit);
            const btn_delete = document.createElement('button');
            btn_delete.className = "lembrete-delete-btn";
            btn_delete.textContent = "❌ Excluir";
            btn_delete.addEventListener('click', e => {
                e.preventDefault();

                onReminderDelete(i);
            });
            span.appendChild(btn_delete);
            li.appendChild(span);
            htmlreminder_list.appendChild(li);
            //elems_html += "<li><span>" + curr.title + "<small> (" + time.toLocaleDateString() + ' ' + time.getHours() + ':' + time.getMinutes() + ")</small></span><span><button class=\"lembrete-edit-btn\">✏️ Editar</button><button class=\"lembrete-delete-btn\">❌ Excluir</button></span></li>"
        }

        //htmlreminder_list.innerHTML = elems_html;
    }
)

let onViewClosed = new Map();

onViewClosed.set("add-lembrete",
    (view) =>{
        editing_reminder = null;
        document.getElementById('lembreteTitulo').value = '';
        document.getElementById('lembreteDescricao').value = '';
        document.getElementById('lembreteData').value = '';
        document.getElementById('lembreteHorario').value = '';
});

onViewClosed.set("add-rotina", 
    (view) => {
        editing_routine = null;
        document.getElementById('rotinaNome').value = '';
        document.getElementById('rotinaDescricao').value = '';
        document.getElementsByName("dias").forEach((elem) => elem.checked = false);
        document.getElementById('rotinaHorario').value = '';
    }
)

/**
 * 
 * @param {number} index 
 */
function onReminderEdit(index)
{
    console.log("Editing " + reminder[index].id);
    const curr = reminder[index];
    const when = new Date(curr.when);
    document.getElementById('lembreteTitulo').value = curr.title;
    document.getElementById('lembreteDescricao').value = curr.description;
    console.log(when.getFullYear() + '-' + (when.getMonth() + 1) + '-' + when.getDate());
    document.getElementById('lembreteData').value = when.getFullYear() + '-' + toDoubleDigit(when.getMonth() + 1) + '-' + toDoubleDigit(when.getDate());
    document.getElementById('lembreteHorario').value = toDoubleDigit(when.getHours()) + ':' + toDoubleDigit(when.getMinutes());
    editing_reminder = curr;

    showView("add-lembrete")
}

/**
 * 
 * @param {number} index 
 */
function onReminderDelete(index)
{
    const curr = reminder[index];
    ipc.sendSync("data.remove_reminder", curr.id);
    onViewOpen.get("lembretes")(document.getElementById("lembretes"));
}

function onRoutineEdit(index)
{
    console.log(index);
    const curr = routine[index];
    /**
     * @type {number[]}
     */
    const days = curr.week_day;
    document.getElementById('rotinaNome').value = curr.title;
    document.getElementById('rotinaDescricao').value = curr.description;
    console.log(days);
    console.log(Array.from(document.getElementsByName("dias")));
    Array.from(document.getElementsByName("dias")).forEach((elem) => {
        let checked = false;
        console.log(toWeekDayNum(elem.getAttribute("value")));
        for(const i in days)
        {
            //console.log(elem.getAttribute("value"));
            //console.log(toWeekDayNum(elem.getAttribute("value")));
            if(days[i] === toWeekDayNum(elem.getAttribute("value")))
            {
                checked = true;
                break;
            }
        }

        console.log(checked);

        elem.checked = checked;
        //elem.setAttribute("checked", checked);
    });
    document.getElementById('rotinaHorario').value = toDoubleDigit(curr.hour) + ':' + toDoubleDigit(curr.minute);

    editing_routine = curr;

    showView("add-rotina");
}

function onRoutineDelete(index)
{
    console.log(index);
    ipc.sendSync("data.remove_routine", routine[index].id);
    onViewOpen.get("rotinas")(document.getElementById("rotinas"));
}

ipc.on('reminder_updated', (event) => {
    if(currentView === "lembretes")
    {
        getReminders();
        onViewOpen.get("lembretes")(document.getElementById("lembretes"));
    }
});

// Target == id of the view to show
function showView(target) {
    // Toggle the active class for views

    console.log("Switched to view ID " + target + ".");

    const tobclosed = document.getElementById(currentView);
    const tobopened = document.getElementById(target);

    if(onViewClosed.has(currentView))
        onViewClosed.get(currentView)(tobclosed);

    tobclosed.classList.toggle('active', false);

    if(onViewOpen.has(target))
        onViewOpen.get(target)(tobopened);

    tobopened.classList.toggle('active', true);

    currentView = target;

    // Toggle the active class for sidebar links
    const links = document.querySelectorAll('.sidebar nav a');

    links.forEach(link => {
    const isActive = link.getAttribute('data-view') === target;

    link.classList.toggle('active', isActive);
    });
}

// Sidebar navigation
function setupSidebarNavigation() {
    const links = document.querySelectorAll('.sidebar nav a');

    links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();

        const targetView = link.getAttribute('data-view');
        showView(targetView);
    });
    });
}

// Button navigation
function setupButtonNavigation() {
    const buttons = document.querySelectorAll('button[data-view]');

    buttons.forEach(button => {
    button.addEventListener('click', () => {
        const targetView = button.getAttribute('data-view');
        showView(targetView);
    });
    });
}

// Initialize navigation
setupSidebarNavigation();
setupButtonNavigation();

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
let pause_state = true;

updateButtonStates({ start: false, pause: true, reset: true });

// Format time into HH:MM:SS
function formatTime(time) {
    const hours = String(Math.floor(time / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Start the timer
function startTimer() {
    if(ipc.sendSync("data.get_stopwatch") == null)
    {
        startBtn.textContent = "Parar ⏹️";
        ipc.sendSync("data.create_stopwatch");
        updateButtonStates({ start: false, pause: false, reset: false });
    }
    else
    {
        ipc.sendSync("data.stop_stopwatch");
        //display.textContent = "00:00:00";
        startBtn.textContent = "▶️ Iniciar";
        updateButtonStates({ start: false, pause: true, reset: true });
    }
    //startTime = Date.now() - elapsedTime;
    //intervalId = setInterval(() => {
    //elapsedTime = Date.now() - startTime;
    //display.textContent = formatTime(elapsedTime);
    //}, 1000);
}

// Pause the timer
function pauseTimer() {
    ipc.send("data.toggle_pause_stopwatch");
    //clearInterval(intervalId);

    if(pause_state)
        pauseBtn.textContent = "➡️ Continar";
    else
        pauseBtn.textContent = "⏸️ Pausar";
    
    pause_state = !pause_state;
    //updateButtonStates({ start: false, pause: true });
}

// Reset the timer
function resetTimer() {
    ipc.send("data.create_stopwatch", true);
    //clearInterval(intervalId);
    //elapsedTime = 0;
    //display.textContent = '00:00:00';
    //updateButtonStates({ start: false, pause: true, reset: true });
}

setInterval(() => {
    if(currentView !== "cronometro")
        return;

    const time_got = ipc.sendSync("data.get_stopwatch");
    if(time_got === null)
    {
        //display.textContent = formatTime(0);
        return;
    }
    display.textContent = formatTime(time_got);
}, 200)

// Update button states
function updateButtonStates({ start, pause, reset }) {

    startBtn.disabled = start;
    pauseBtn.disabled = pause;
    resetBtn.disabled = reset;
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

document.getElementById('rotinaForm').addEventListener('submit',
    // Form submissions
    /**
     * @param {string} rotinaHorario
     */
    e => {
    e.preventDefault();

    const rotinaNome = document.getElementById('rotinaNome').value;
    const rotinaDescricao = document.getElementById('rotinaDescricao').value || '';
    const rotinaDias = Array.from(document.querySelectorAll('input[name="dias"]:checked'))
    .map(input => toWeekDayNum(input.value))
    //.join(', ') || 'Sem dias selecionados';
    //console.log(rotinaDias);
    /**
     * @type {string}
     */
    const rotinaHorario = document.getElementById('rotinaHorario').value;
    const horario_elems = rotinaHorario.split(':');

    // Todo: Criar nova rotina
    //alert(`Rotina:\nNome: ${rotinaNome}\nDescrição: ${rotinaDescricao}\nDias: ${rotinaDias}\nHorário: ${rotinaHorario}`);
    //console.log([rotinaNome, rotinaDescricao, rotinaDias, Number.parseInt(horario_elems[0]), Number.parseInt(horario_elems[1])]);
    ipc.sendSync("data.create_routine", rotinaNome, rotinaDescricao, rotinaDias, Number.parseInt(horario_elems[0]), Number.parseInt(horario_elems[1]));
    if(editing_routine != null) console.log(editing_routine.id);
    console.log("is this working")

    if(editing_routine != null)
        ipc.sendSync("data.remove_routine", editing_routine.id);

    console.log("reached");
    showView('rotinas');
});

document.getElementById('lembreteForm').addEventListener('submit', e => {
    e.preventDefault();

    /**
     * @type {string}
     */
    const lembreteTitulo = document.getElementById('lembreteTitulo').value;
    /**
     * @type {string}
     */
    const lembreteDescricao = document.getElementById('lembreteDescricao').value || '';
    /**
     * @type {string}
     */
    const lembreteData = document.getElementById('lembreteData').value;
    const date_elems = lembreteData.split('-');
    /**
     * @type {string}
     */
    const lembreteHorario = document.getElementById('lembreteHorario').value;
    const reminder_time = lembreteHorario.split(':');

    // Todo: Criar novo lembrete
    ipc.send("data.create_reminder", lembreteTitulo, lembreteDescricao, Number.parseInt(date_elems[0]), Number.parseInt(date_elems[1]), Number.parseInt(date_elems[2]), Number.parseInt(reminder_time[0]), Number.parseInt(reminder_time[1]));
    //alert(`Lembrete:\nTítulo: ${lembreteTitulo}\nDescrição: ${lembreteDescricao}\nData: ${lembreteData}\nHorário: ${lembreteHorario}`);

    if(editing_reminder != null)
        ipc.sendSync("data.remove_reminder", editing_reminder.id);
    showView('lembretes');
});
/**
 * 
 * @param {Element} element 
 */
function clearChildren(element)
{
    while (element.firstChild)
    {
        element.removeChild(element.lastChild);
    }
}

function toWeekDay(dayNum)
{
    let result;

    switch(dayNum)
    {
        case 0:
            result = "Dom"
            break;
        case 1:
            result = "Seg"
            break;
        case 2:
            result = "Ter"
            break;
        case 3:
            result = "Qua"
            break;
        case 4:
            result = "Qui"
            break;
        case 5:
            result = "Sex"
            break;
        case 6:
            result = "Sab"
            break;
    }

    return result;
}

function toWeekDayNum(dayNum)
{
    let result;

    switch(dayNum)
    {
        case "Dom":
            result = 0
            break;
        case "Seg":
            result = 1
            break;
        case "Ter":
            result = 2
            break;
        case "Qua":
            result = 3
            break;
        case "Qui":
            result = 4
            break;
        case "Sex":
            result = 5
            break;
        case "Sab":
            result = 6
            break;
    }

    return result;
}
/**
 * 
 * @param {number} num 
 * @returns 
 */
function toDoubleDigit(num)
{
    return (num > 10 ? num.toString() : ("0" + num))
}

function getRoutines()
{
    const result = ipc.sendSync("data.get_routines");
    routine = result;
    return result;
}

function getReminders()
{
    const result = ipc.sendSync("data.get_reminders");
    reminder = result;
    return result;
}

document.querySelectorAll('.rotina-edit-btn, .rotina-delete-btn, .lembrete-edit-btn, .lembrete-delete-btn').forEach(button => {
  button.addEventListener('click', (event) => {
    console.log(`Botão apertado: ${event.target.classList}`);
  });
});