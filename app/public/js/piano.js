const pianoContainer = document.getElementById('virtual-piano');
const midiStatus = document.getElementById('midi-status');
const pianoWrapper = document.getElementById('piano-container-wrapper');
const togglePianoBtn = document.getElementById('toggle-piano-btn');

// Constants derived from midi-jar
const START_NOTE = 21; // A0
const END_NOTE = 108;  // C8
const WHITE_WIDTH = 41;
const BLACK_WIDTH = 24;
const KEY_HEIGHT = 140; // Fixed height
const BLACK_HEIGHT = KEY_HEIGHT * 0.65;

const keyElements = {}; // Map: note -> SVGElement

// Toggle Piano

togglePianoBtn.addEventListener('click', () => {
    if (pianoWrapper.style.display === 'none' || pianoWrapper.style.display === '') {
        pianoWrapper.style.display = 'flex'; // Changed to flex to center
        togglePianoBtn.classList.add('active');

        // Recalculate dimensions and scroll when it becomes visible
        // Brief timeout ensures CSS transition or rendering is active/ready
        setTimeout(() => {
            // Force check if 88 keys are rendered correctly (re-render if needed or just scroll)
            scrollToMiddle();
        }, 50);
    } else {
        pianoWrapper.style.display = 'none';
        togglePianoBtn.classList.remove('active');
    }
});

function isBlackKey(note) {
    const n = note % 12;
    return n === 1 || n === 3 || n === 6 || n === 8 || n === 10;
}

function getNoteName(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[note % 12] + (Math.floor(note / 12) - 1);
}

function initPiano() {
    pianoContainer.innerHTML = '';

    // Calculate dimensions
    let whiteKeyCount = 0;
    for (let i = START_NOTE; i <= END_NOTE; i++) {
        if (!isBlackKey(i)) whiteKeyCount++;
    }

    const totalWidth = whiteKeyCount * WHITE_WIDTH;

    // Create SVG
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", totalWidth);
    svg.setAttribute("height", KEY_HEIGHT);
    svg.classList.add("piano-svg");

    // Definitions (Gradients)
    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = `
        <linearGradient id="whiteKeyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fff" />
            <stop offset="100%" stop-color="#f0f0f0" />
        </linearGradient>
        <linearGradient id="blackKeyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#333" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
    `;
    svg.appendChild(defs);

    // Groups for layering (Whites bottom, Blacks top)
    const whiteGroup = document.createElementNS(svgNS, "g");
    const blackGroup = document.createElementNS(svgNS, "g");
    const labelGroup = document.createElementNS(svgNS, "g");

    svg.appendChild(whiteGroup);
    svg.appendChild(blackGroup);
    svg.appendChild(labelGroup); // Labels on top

    let currentWhiteIndex = 0;

    for (let note = START_NOTE; note <= END_NOTE; note++) {
        const isBlack = isBlackKey(note);

        if (!isBlack) {
            // White Key
            const x = currentWhiteIndex * WHITE_WIDTH;
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", WHITE_WIDTH - 1); // -1 for gap
            rect.setAttribute("height", KEY_HEIGHT);
            rect.setAttribute("rx", 3); // Border radius
            rect.setAttribute("ry", 3);
            rect.classList.add("piano-key-white");
            rect.dataset.note = note;

            // Optional: Label for C notes
            if (note % 12 === 0) { // C notes
                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", x + WHITE_WIDTH / 2);
                text.setAttribute("y", KEY_HEIGHT - 10);
                text.setAttribute("text-anchor", "middle");
                text.textContent = "C" + (Math.floor(note / 12) - 1);
                text.classList.add("piano-key-text", "white-text");
                labelGroup.appendChild(text);
            }

            // Events
            addKeyEvents(rect, note);
            whiteGroup.appendChild(rect);
            keyElements[note] = rect;
            currentWhiteIndex++;
        } else {
            // Black Key
            // Position relative to the *previous* white key boundary
            // Specifically, centered on the line between currentWhiteIndex-1 and currentWhiteIndex
            // Previous white ends at: currentWhiteIndex * WHITE_WIDTH
            // We want center of black key at: currentWhiteIndex * WHITE_WIDTH

            const x = (currentWhiteIndex * WHITE_WIDTH) - (BLACK_WIDTH / 2);

            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", BLACK_WIDTH);
            rect.setAttribute("height", BLACK_HEIGHT);
            rect.setAttribute("rx", 2);
            rect.setAttribute("ry", 2);
            rect.classList.add("piano-key-black");
            rect.dataset.note = note;

            // Events
            addKeyEvents(rect, note);
            blackGroup.appendChild(rect);
            keyElements[note] = rect;
        }
    }

    pianoContainer.appendChild(svg);

    // Scroll to Middle C (C4 - Note 60)
    // Give a slight delay to ensure layout is painted
    setTimeout(scrollToMiddle, 100);
}

function scrollToMiddle() {
    const noteC4 = 60;
    const key = keyElements[noteC4];
    if (key && pianoContainer) {
        // C4 is white key index ? 
        // We know its physical x position from the SVG rect
        const x = parseFloat(key.getAttribute('x'));
        const containerWidth = pianoContainer.clientWidth;

        // Center: x - half_container + half_key
        const scrollPos = x - (containerWidth / 2) + (WHITE_WIDTH / 2);

        pianoContainer.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
        });
    }
}

// Center on resize
window.addEventListener('resize', () => {
    // Only if piano is visible
    if (pianoWrapper.style.display !== 'none') {
        scrollToMiddle();
    }
});

function addKeyEvents(element, note) {
    // Mouse Events
    element.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent text selection
        playNote(note, 100, 'local');
    });
    element.addEventListener('mouseup', () => stopNote(note, 'local'));
    element.addEventListener('mouseleave', (e) => {
        // Only stop if button is pressed (drag play support could be added here)
        if (e.buttons === 1) stopNote(note, 'local');
    });

    // Touch Events for mobile support
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playNote(note, 100, 'local');
    });
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopNote(note, 'local');
    });
}


// Reproducción Visual
function playNote(note, velocity, origin = 'local') {
    const key = keyElements[note];
    if (key) {
        key.classList.add('active');
        key.classList.add(origin);

        if (origin === 'local' && typeof roomId !== 'undefined' && roomId) {
            socket.emit('note-on', roomId, { note, velocity });
        }
    }
}

function stopNote(note, origin = 'local') {
    const key = keyElements[note];
    if (key) {
        // Only remove if it matches the origin to prevent remote stopping local hold
        if (key.classList.contains(origin)) {
            key.classList.remove('active', 'local', 'remote');

            if (origin === 'local' && typeof roomId !== 'undefined' && roomId) {
                socket.emit('note-off', roomId, { note });
            }
        }
    }
}

let globalMidiAccess = null;
let currentMidiInput = null;

// Web MIDI API
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    midiStatus.innerText = 'Web MIDI no soportado';
}

function onMIDISuccess(midiAccess) {
    globalMidiAccess = midiAccess;
    midiStatus.innerText = 'MIDI: Listo - Selecciona dispositivo';

    // Auto-detect if only one device? Maybe better to wait for user selection as requested.
    // For now, we update the list in settings.js, but piano.js waits for selection.

    midiAccess.onstatechange = (e) => {
        // Just update status log

    };
}

function onMIDIFailure() {
    midiStatus.innerText = 'Error MIDI';
}

// Global function called by settings.js
window.changeMidiInput = (deviceId) => {
    if (!globalMidiAccess) return;

    // Disconnect previous
    if (currentMidiInput) {
        currentMidiInput.onmidimessage = null;
    }

    if (deviceId === 'none' || !deviceId) {
        midiStatus.innerText = 'MIDI: Desconectado';
        currentMidiInput = null;
        return;
    }

    // Find new input
    const inputs = globalMidiAccess.inputs.values();
    for (let input of inputs) {
        if (input.id === deviceId) {
            currentMidiInput = input;
            currentMidiInput.onmidimessage = getMIDIMessage;
            midiStatus.innerText = `MIDI: ${input.name}`;

            return;
        }
    }
};

function getMIDIMessage(message) {
    const command = message.data[0];
    const note = message.data[1];
    const velocity = (message.data.length > 2) ? message.data[2] : 0;

    if (command >= 144 && command <= 159 && velocity > 0) {
        playNote(note, velocity, 'local');
    }
    else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && velocity === 0)) {
        stopNote(note, 'local');
    }
}

// Sockets
if (typeof socket !== 'undefined') {
    socket.on('note-on', (data) => playNote(data.note, data.velocity, 'remote'));
    socket.on('note-off', (data) => stopNote(data.note, 'remote'));
}

// Init
initPiano();
