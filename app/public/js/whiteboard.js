const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
const brushSize = document.getElementById('brush-size');
const eraserBtn = document.getElementById('eraser-btn');
const pencilBtn = document.getElementById('pencil-btn');

// Configuración inicial
function resizeCanvas() {
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();

    // Set actual size in memory to match display size exactly
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Redibujar contexto si es necesario (se pierde al redimensionar)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
}

// Llamar al inicio
resizeCanvas();

// Estado del pincel
let isDrawing = false;
let isEraser = false;
let points = []; // Store points for potential smoothing
let currentColor = colorPicker.value;
let currentSize = brushSize.value;

// --- Event Listeners for Toolbar ---
// --- Event Listeners for Toolbar ---
// --- Event Listeners for Toolbar ---
if (pencilBtn) {
    pencilBtn.addEventListener('click', () => {
        isEraser = false;
        pencilBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        canvas.classList.remove('eraser-active');
    });
}

colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
    isEraser = false;
    if (pencilBtn) pencilBtn.classList.add('active');
    eraserBtn.classList.remove('active');
    canvas.classList.remove('eraser-active');
});

brushSize.addEventListener('input', (e) => {
    currentSize = e.target.value;
});

eraserBtn.addEventListener('click', () => {
    isEraser = true;
    eraserBtn.classList.add('active');
    if (pencilBtn) pencilBtn.classList.remove('active');
    canvas.classList.add('eraser-active');
});

// Ajustar tamaño al redimensionar ventana (Robust & Persistent)
function handleResize() {
    if (canvas.width > 0 && canvas.height > 0) {
        // 1. Create temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // 2. Copy current content to temp
        tempCtx.drawImage(canvas, 0, 0);

        // 3. Resize main canvas
        resizeCanvas();

        // 4. Restore content (scaled or centered? Excalidraw style: keep top-left or scale? 
        // We'll draw back at 0,0. Browser handles clipping/empty space)
        ctx.drawImage(tempCanvas, 0, 0);
    } else {
        resizeCanvas();
    }
}

const resizeObserver = new ResizeObserver(() => {
    handleResize();
});

resizeObserver.observe(canvas.parentElement);

window.addEventListener('resize', handleResize);

// Helper for exact coordinates
function getPos(e) {
    const rect = canvas.getBoundingClientRect();

    // Scale factors in case of CSS resizing (responsiveness)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (e.type === 'touchstart') e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    points = [pos];
}

function draw(e) {
    if (e.type === 'touchmove') e.preventDefault();
    if (!isDrawing) return;

    const pos = getPos(e);
    points.push(pos);

    if (points.length >= 2) {
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1]; // current

        drawLine(p1.x, p1.y, pos.x, pos.y, isEraser ? 'eraser' : currentColor, currentSize);

        if (typeof roomId !== 'undefined' && roomId) {
            socket.emit('draw-stroke', roomId, {
                x0: p1.x,
                y0: p1.y,
                x1: pos.x,
                y1: pos.y,
                color: isEraser ? 'eraser' : currentColor,
                size: currentSize
            });
        }
    }
}

function stopDrawing() {
    isDrawing = false;
    points = [];
}

function drawLine(x0, y0, x1, y1, color, size) {
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);

    if (color === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
}

// Mouse Events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch Events for Tablet/Mobile
// Passive: false is crucial for preventing scrolling
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// Recibir eventos de dibujo remotos
socket.on('draw-stroke', (data) => {
    drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size);
});

// Limpiar pizarra
function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (roomId) {
        socket.emit('clear-board', roomId);
    }
}

socket.on('clear-board', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
