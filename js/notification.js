const { ipcRenderer } = require("electron");
const path = require("path")

ipcRenderer.on("receive-data", displayNotification)

let loop_path = null;

function displayNotification(event, { type, title, description, timestamp }, path_alarm) {
    const formattedTimestamp = new Date(timestamp).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('notification-header-text').textContent = "Notificação de " + notifTypeToPtbr(type) + '!';
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-description').textContent = description;
    document.getElementById('notification-timestamp').textContent = formattedTimestamp;

    loop_path = path_alarm;
    let audio = new Audio(path_alarm)
    audio.loop = true;
    audio.play();
}

// Exemplo
displayNotification(null, {
    type: "Lembrete",
    title: "Reunião às 14h",
    description: "Não se esqueça da reunião com o time de desenvolvimento.",
    timestamp: new Date(2025, 4, 30, 14, 0).getTime()
});

function notifTypeToPtbr(type)
{
    if(type === "reminder")
        return "lembrete";
    if(type === "routine")
        return "rotina";
}