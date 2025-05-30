const electron = require('electron');
const ipc = electron.ipcRenderer;

let routine = [];
let reminder = [];

const views = document.querySelectorAll('.view');

let onViewSelect = new Map();
/**
 * @param {Element} view
 */
onViewSelect.set("rotinas",
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

            const to_append = document.createElement("li");
            const append_span = document.createElement("span");
            append_span.textContent = curr.title;
            const append_small = document.createElement("small");
            append_small.textContent = toWeekDay(curr.week_day);
            append_span.appendChild(append_small);
            to_append.appendChild(append_span);
            htmlroutine_list.appendChild(to_append);
        }
});

// Target == id of the view to show
function showView(target) {
    // Toggle the active class for views
    views.forEach(view => {
        const isActive = view.id === target;
        //Executes the initialization function of the view.
        if(isActive && onViewSelect.has(target))
            onViewSelect.get(target)(view);

        view.classList.toggle('active', isActive);
    });

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

// Cronômetro logic
let startTime = 0;
let elapsedTime = 0;
let intervalId;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// Format time into HH:MM:SS
function formatTime(time) {
    const hours = String(Math.floor(time / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Start the timer
function startTimer() {
    startTime = Date.now() - elapsedTime;
    intervalId = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    display.textContent = formatTime(elapsedTime);
    }, 1000);

    updateButtonStates({ start: true, pause: false, reset: false });
}

// Pause the timer
function pauseTimer() {
    clearInterval(intervalId);
    updateButtonStates({ start: false, pause: true });
}

// Reset the timer
function resetTimer() {
    clearInterval(intervalId);
    elapsedTime = 0;
    display.textContent = '00:00:00';
    updateButtonStates({ start: false, pause: true, reset: true });
}

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

// Form submissions
document.getElementById('rotinaForm').addEventListener('submit', e => {
    e.preventDefault();

    const rotinaNome = document.getElementById('rotinaNome').value;
    const rotinaDescricao = document.getElementById('rotinaDescricao').value || 'Sem descrição';
    const rotinaDias = Array.from(document.querySelectorAll('input[name="dias"]:checked'))
    .map(input => input.value)
    .join(', ') || 'Sem dias selecionados';
    const rotinaHorario = document.getElementById('rotinaHorario').value;

    // Todo: Criar nova rotina
    alert(`Rotina:\nNome: ${rotinaNome}\nDescrição: ${rotinaDescricao}\nDias: ${rotinaDias}\nHorário: ${rotinaHorario}`);
    showView('rotinas');
});

document.getElementById('lembreteForm').addEventListener('submit', e => {
    e.preventDefault();

    const lembreteTitulo = document.getElementById('lembreteTitulo').value;
    const lembreteDescricao = document.getElementById('lembreteDescricao').value || 'Sem descrição';
    const lembreteData = document.getElementById('lembreteData').value;
    const lembreteHorario = document.getElementById('lembreteHorario').value;

    // Todo: Criar novo lembrete
    alert(`Lembrete:\nTítulo: ${lembreteTitulo}\nDescrição: ${lembreteDescricao}\nData: ${lembreteData}\nHorário: ${lembreteHorario}`);
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
        case 1:
            result = "Dom"
            break;
        case 2:
            result = "Seg"
            break;
        case 3:
            result = "Ter"
            break;
        case 4:
            result = "Qua"
            break;
        case 5:
            result = "Qui"
            break;
        case 6:
            result = "Sex"
            break;
        case 7:
            result = "Sab"
            break;
    }

    return result;
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