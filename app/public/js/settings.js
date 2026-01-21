// settings.js - Manejo de configuración de dispositivos A/V

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');

const audioInputSelect = document.getElementById('audio-input-select');
const videoInputSelect = document.getElementById('video-input-select');
const audioOutputSelect = document.getElementById('audio-output-select');
const midiInputSelect = document.getElementById('midi-input-select');

// Estado local de dispositivos seleccionados
let currentAudioDeviceId = null;
let currentVideoDeviceId = null;
let currentAudioOutputId = 'default';
let currentMidiInputId = 'none';

// Toggle Modal
settingsBtn.addEventListener('click', async () => {
    settingsModal.classList.remove('hidden');
    // Forzar enumeración fresca al abrir
    await getDevices();
    await getMidiDevices();
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Cerrar al hacer clic fuera
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Enumerar dispositivos A/V
async function getDevices() {
    try {
        // Pedir permisos si no hay labels (hack común en navegadores)
        // Ya deberíamos tener permisos por el getUserMedia inicial en webrtc.js,
        // pero por seguridad chequeamos.
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Limpiar selects
        audioInputSelect.innerHTML = '';
        videoInputSelect.innerHTML = '';
        audioOutputSelect.innerHTML = '<option value="default">Por Defecto</option>';

        devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `${device.kind} ${device.deviceId.slice(0, 5)}...`;

            if (device.kind === 'audioinput') {
                audioInputSelect.appendChild(option);
            } else if (device.kind === 'videoinput') {
                videoInputSelect.appendChild(option);
            } else if (device.kind === 'audiooutput') {
                option.text = device.label || `Speaker ${device.deviceId.slice(0, 5)}...`;
                audioOutputSelect.appendChild(option);
            }
        });

        // Set current selection if exists
        if (currentAudioDeviceId) audioInputSelect.value = currentAudioDeviceId;
        if (currentVideoDeviceId) videoInputSelect.value = currentVideoDeviceId;
        if (currentAudioOutputId) audioOutputSelect.value = currentAudioOutputId;

    } catch (error) {
        console.error('Error enumerando dispositivos A/V:', error);
    }
}

// Enumerar dispositivos MIDI
async function getMidiDevices() {
    if (!navigator.requestMIDIAccess) {
        midiInputSelect.innerHTML = '<option>WebMIDI no soportado</option>';
        return;
    }

    try {
        const midiAccess = await navigator.requestMIDIAccess();
        const inputs = midiAccess.inputs;

        midiInputSelect.innerHTML = '<option value="none">-- Seleccionar MIDI --</option>';

        inputs.forEach(input => {
            const option = document.createElement('option');
            option.value = input.id;
            option.text = input.name || `MIDI Device ${input.id} `;
            midiInputSelect.appendChild(option);
        });

        if (currentMidiInputId) midiInputSelect.value = currentMidiInputId;

        // Escuchar conexiones en caliente
        midiAccess.onstatechange = (e) => {

            getMidiDevices(); // Refrescar lista
        };

    } catch (err) {
        console.error('Error accediendo a MIDI:', err);
        midiInputSelect.innerHTML = '<option>Acceso denegado</option>';
    }
}

// Listeners para cambios
audioInputSelect.addEventListener('change', (e) => {
    currentAudioDeviceId = e.target.value;
    if (window.changeAudioInput) window.changeAudioInput(currentAudioDeviceId);
});

videoInputSelect.addEventListener('change', (e) => {
    currentVideoDeviceId = e.target.value;
    if (window.changeVideoInput) window.changeVideoInput(currentVideoDeviceId);
});

audioOutputSelect.addEventListener('change', (e) => {
    currentAudioOutputId = e.target.value;
    if (window.changeAudioOutput) window.changeAudioOutput(currentAudioOutputId);
});

midiInputSelect.addEventListener('change', (e) => {
    currentMidiInputId = e.target.value;
    if (window.changeMidiInput) window.changeMidiInput(currentMidiInputId);
});

// Inicialización
// Esperamos un poco para asegurar que webrtc haya pedido permisos primero
setTimeout(() => {
    getDevices();
    getMidiDevices();
}, 1000);
