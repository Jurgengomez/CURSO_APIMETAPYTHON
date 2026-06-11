document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('log-table-body');
    
    // Función para formatear el contenido del mensaje
    function formatMessageContent(text) {
        try {
            // Intentar parsear como JSON para formatearlo bonito
            const jsonObject = JSON.parse(text);
            const formattedJson = JSON.stringify(jsonObject, null, 2);
            return `<pre class="json-block">${escapeHTML(formattedJson)}</pre>`;
        } catch (e) {
            // Si no es un JSON válido, mostrar como texto plano
            return `<span>${escapeHTML(text)}</span>`;
        }
    }

    // Evitar ataques XSS al renderizar texto dinámico
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Función para obtener logs del servidor y actualizar la tabla
    async function fetchLogs() {
        try {
            const response = await fetch('/api/logs');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const logs = await response.json();
            
            if (logs.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--text-secondary);">No hay registros aún. Envía un mensaje desde WhatsApp.</td></tr>`;
                return;
            }

            // Mapear logs a filas HTML
            const rowsHTML = logs.map(log => {
                const formattedTime = log.fecha_y_hora;
                const formattedContent = formatMessageContent(log.texto);
                return `
                    <tr>
                        <td class="time-cell">${escapeHTML(formattedTime)}</td>
                        <td>${formattedContent}</td>
                    </tr>
                `;
            }).join('');

            tableBody.innerHTML = rowsHTML;
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    }

    // Consultar inmediatamente al cargar
    fetchLogs();

    // Polling cada 3 segundos
    setInterval(fetchLogs, 3000);
});
