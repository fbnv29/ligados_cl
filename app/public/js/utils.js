// Inicialización de Socket.io y variables globales
const socket = io('/');
const params = new URLSearchParams(window.location.search);
const roomId = params.get('id');

if (!roomId) {
    alert('No se especificó un ID de sala. Redirigiendo al inicio.');
    window.location.href = '/';
}
