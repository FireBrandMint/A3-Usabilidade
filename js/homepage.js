const views = document.querySelectorAll('.view');

// Target == id of the view to show
function showView(target) {
    // Toggle the active class for views
    views.forEach(view => {
        const isActive = view.id === target;
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