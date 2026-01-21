const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de conexiones Socket.io
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Estado de las salas
    const roomHosts = {}; // { roomId: socketId }
    const roomTimers = {}; // { roomId: { endTime: number, duration: number, interval: Interval } }

    // Unirse a una sala
    socket.on('join-room', (roomId, userId) => {
        console.log(`Usuario ${userId} uniéndose a la sala ${roomId}`);
        socket.join(roomId);

        // Asignar Host si es el primero
        if (!roomHosts[roomId]) {
            roomHosts[roomId] = socket.id;
            socket.emit('role-assigned', 'host');
        } else {
            socket.emit('role-assigned', 'guest');
        }

        // Sincronizar temporizador si existe
        if (roomTimers[roomId]) {
            const remaining = Math.max(0, Math.ceil((roomTimers[roomId].endTime - Date.now()) / 1000));
            socket.emit('timer-update', remaining);
        }

        socket.to(roomId).emit('user-connected', userId);

        // Manejar desconexión
        socket.on('disconnect', () => {
            console.log(`Usuario ${userId} desconectado de la sala ${roomId}`);
            socket.to(roomId).emit('user-disconnected', userId);

            // Si el host se va, el siguiente en la sala (si hay) podría ser host
            // Por simplicidad MVP, si el host se va, borramos la asignación y el timer
            if (roomHosts[roomId] === socket.id) {
                delete roomHosts[roomId];
                if (roomTimers[roomId]) {
                    clearInterval(roomTimers[roomId].interval);
                    delete roomTimers[roomId];
                }
                // Opcional: Reasignar host al siguiente socket en la sala
                // const clients = io.sockets.adapter.rooms.get(roomId);
                // if (clients && clients.size > 0) { ... }
            }
        });
    });

    // Gestión del Temporizador
    socket.on('start-timer', (roomId, minutes) => {
        // Verificar si es host (capa de seguridad básica)
        if (roomHosts[roomId] !== socket.id) return;

        const durationSec = minutes * 60;
        const endTime = Date.now() + (durationSec * 1000);

        if (roomTimers[roomId]) clearInterval(roomTimers[roomId].interval);

        roomTimers[roomId] = {
            endTime: endTime,
            duration: durationSec,
            interval: null
        };

        // Emitir inicio inmediato
        io.to(roomId).emit('timer-update', durationSec);

        // Intervalo para asegurar sincronización (opcional, client-side es mejor para UI fluida)
        // Pero útil para nuevos usuarios
    });

    socket.on('stop-timer', (roomId) => {
        if (roomHosts[roomId] !== socket.id) return;

        if (roomTimers[roomId]) {
            clearInterval(roomTimers[roomId].interval);
            delete roomTimers[roomId];
        }
        io.to(roomId).emit('timer-stopped');
    });

    // Señalización para Pizarra
    socket.on('draw-stroke', (roomId, data) => {
        socket.to(roomId).emit('draw-stroke', data);
    });

    socket.on('clear-board', (roomId) => {
        socket.to(roomId).emit('clear-board');
    });

    // Señalización para Piano MIDI
    socket.on('note-on', (roomId, data) => {
        socket.to(roomId).emit('note-on', data);
    });

    socket.on('note-off', (roomId, data) => {
        socket.to(roomId).emit('note-off', data);
    });

    // Señalización para WebRTC (Oferta, Respuesta, ICE Candidates)
    // Nota: En una implementación completa P2P Mesh, esto se retransmite a otros peers
    // Para simplificar MVP 1-a-1:
    socket.on('offer', (roomId, offer, userId) => {
        socket.to(roomId).emit('offer', offer, userId); // Envia el offer y quien lo envía
    });

    socket.on('answer', (roomId, answer, userId) => {
        socket.to(roomId).emit('answer', answer, userId);
    });

    socket.on('ice-candidate', (roomId, candidate, userId) => {
        socket.to(roomId).emit('ice-candidate', candidate, userId);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para la sala
app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

http.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
