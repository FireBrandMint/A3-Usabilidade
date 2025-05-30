function displayNotification({ type, title, description, timestamp }) {
    const formattedTimestamp = timestamp.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    document.getElementById('notification-type').textContent = type;
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-description').textContent = description;
    document.getElementById('notification-timestamp').textContent = formattedTimestamp;
}

// Exemplo
displayNotification({
    type: "Lembrete",
    title: "Reunião às 14h",
    description: "Não se esqueça da reunião com o time de desenvolvimento.",
    timestamp: new Date(2025, 4, 30, 14, 0)
});