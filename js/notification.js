function displayNotification({ type, title, description, timestamp }) {
    document.getElementById('notification-type').textContent = type;
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-description').textContent = description;
    document.getElementById('notification-timestamp').textContent = timestamp;
}

// Exemplo
displayNotification({
    type: "Lembrete",
    title: "Reunião às 15h",
    description: "Não se esqueça da reunião com o time de desenvolvimento.",
    timestamp: "30/05/2025 14:00"
});