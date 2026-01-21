// Banner UI Logic

// DOM Elements
const roomCodeDisplay = document.getElementById('room-code-display');
const copyRoomBtn = document.getElementById('copy-room-btn');
const timerDisplay = document.getElementById('timer-display');
const timerControls = document.getElementById('timer-controls');
const timerInput = document.getElementById('timer-input');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const timerContainer = document.getElementById('timer-container');
const clockDisplay = document.getElementById('clock-display');

// Constants
let isHost = false;
let timerInterval = null;

// --- 1. Reloj Digital (Clock) ---
function updateClock() {
    const now = new Date();
    clockDisplay.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock(); // Init immediately

// --- 2. Portapapeles (Clipboard) ---
// Obtener ID desde query param 'id' (redirección de index.html)
const urlParams = new URLSearchParams(window.location.search);
const currentRoomId = urlParams.get('id') || 'Sala-Demo';

roomCodeDisplay.textContent = currentRoomId;

copyRoomBtn.addEventListener('click', () => {
    // Copiar URL completa para facilitar acceso futuro
    const fullUrl = window.location.href;

    navigator.clipboard.writeText(fullUrl).then(() => {
        const originalText = roomCodeDisplay.textContent;
        // Feedback visual sutil (cambio de icono o color)
        roomCodeDisplay.textContent = "¡URL Copiada!";
        roomCodeDisplay.style.color = "#2563eb";

        setTimeout(() => {
            roomCodeDisplay.textContent = currentRoomId;
            roomCodeDisplay.style.color = "var(--text-primary)";
        }, 1500);
    });
});


// --- 3. Roles & Timer Logic (Socket.IO) ---
// Asumimos que socket ya existe globalmente desde room.html

socket.on('role-assigned', (role) => {

    isHost = (role === 'host');
    updateTimerUI();
});

function updateTimerUI() {
    if (isHost) {
        timerControls.classList.remove('hidden');
        timerDisplay.classList.add('hidden'); // Host ve controles + input
    } else {
        timerControls.classList.add('hidden');
        timerDisplay.classList.remove('hidden'); // Guest ve solo el display
    }
}

// Timer Controls (Host Only)
startTimerBtn.addEventListener('click', () => {
    const minutes = parseInt(timerInput.value);
    if (minutes > 0) {
        socket.emit('start-timer', currentRoomId, minutes);
    }
});

stopTimerBtn.addEventListener('click', () => {
    socket.emit('stop-timer', currentRoomId);
});

// Timer Updates (All Users)
socket.on('timer-update', (remainingSeconds) => {
    startLocalCountdown(remainingSeconds);

    // Si soy host, visualmente podría querer ver también el countdown
    // Opcional: Mostrar countdown pequeño o cambiar color del input
    if (isHost) {
        // Para UX simple, el host sigue viendo controles, pero el input podría deshabilitarse
        // O podríamos mostrar el countdown en el botón de input
    }
});

socket.on('timer-stopped', () => {
    stopLocalCountdown();
    timerDisplay.textContent = "00:00";
});

function startLocalCountdown(seconds) {
    if (timerInterval) clearInterval(timerInterval);

    let timeLeft = seconds;
    updateTimerDisplay(timeLeft);
    timerDisplay.classList.remove('hidden'); // Mostrar display a todos cuando corre

    if (isHost) {
        // Host ve ambos (o controles deshabilitados)
        timerControls.classList.add('hidden'); // Ocultar controles mientras corre para limpiar
        // Agregamos un boton de STOP visible al host en lugar del display? 
        // Por ahora, simple: Host ve display + boton stop superpuesto o rediseñado?
        // Simplificación: Host ve el display IGUAL que los alumnos, pero con un botón pequeño de stop al lado

        // Re-inyectamos botón stop si no existe
        if (!document.getElementById('emergency-stop-btn')) {
            const btn = document.createElement('button');
            btn.id = 'emergency-stop-btn';
            btn.textContent = '⏹';
            btn.className = 'icon-btn-small';
            btn.style.marginLeft = '10px';
            btn.onclick = () => socket.emit('stop-timer', currentRoomId);
            timerDisplay.appendChild(btn);
        }
    }

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Timer finalizado logic (sonido?)
        }
    }, 1000);
}

function stopLocalCountdown() {
    if (timerInterval) clearInterval(timerInterval);
    updateTimerUI(); // Volver a estado inicial
    // Remover boton emergencia si existe
    const btn = document.getElementById('emergency-stop-btn');
    if (btn) btn.remove();
}

function updateTimerDisplay(seconds) {
    if (seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;

    // Si soy Host, asegurarme de re-appendear el botón stop si se borró al actualizar textContent
    if (isHost && timerInterval) {
        if (!document.getElementById('emergency-stop-btn')) {
            const btn = document.createElement('button');
            btn.id = 'emergency-stop-btn';
            btn.textContent = '⏹';
            btn.className = 'icon-btn-small';
            btn.style.marginLeft = '10px';
            btn.onclick = () => socket.emit('stop-timer', currentRoomId);
            timerDisplay.appendChild(btn);
        }
    }
}
