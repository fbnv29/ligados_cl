const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

let localStream;
let myPeerConnection;
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Servidor STUN gratuito de Google
    ]
};

// Obtener acceso a cámara y micrófono
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    localStream = stream;
    addVideoStream(myVideo, stream);

    // Unirse a la sala
    socket.emit('join-room', roomId, socket.id);

    // Cuando otro usuario se conecta
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    // Manejar Oferta WebRTC (Respuesta al intento de conexión de otro)
    socket.on('offer', async (offer, userId) => {
        if (!peers[userId]) {
            createPeerConnection(userId);
        }
        await peers[userId].setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peers[userId].createAnswer();
        await peers[userId].setLocalDescription(answer);
        socket.emit('answer', roomId, answer, userId);
    });

    // Manejar Respuesta WebRTC
    socket.on('answer', async (answer, userId) => {
        if (peers[userId]) {
            await peers[userId].setRemoteDescription(new RTCSessionDescription(answer));
        }
    });

    // Manejar ICE Candidates
    socket.on('ice-candidate', async (candidate, userId) => {
        if (peers[userId]) {
            await peers[userId].addIceCandidate(new RTCIceCandidate(candidate));
        }
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close();
            delete peers[userId];
        }
        // Remover video elemento asociado si existiera (implementación simplificada)
        const videoToRemove = document.getElementById(userId);
        if (videoToRemove) videoToRemove.remove();
    });
});


function createPeerConnection(userId) {
    const pc = new RTCPeerConnection(rtcConfig);
    peers[userId] = pc;

    // Agregar tracks locales
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });

    // Manejar ICE candidates locales
    pc.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('ice-candidate', roomId, event.candidate, userId);
        }
    };

    // Manejar stream remoto
    pc.ontrack = event => {
        const existingVideo = document.getElementById(userId);
        if (existingVideo) return; // Ya existe

        const remoteVideo = document.createElement('video');
        remoteVideo.id = userId;
        addVideoStream(remoteVideo, event.streams[0]);
    };

    return pc;
}

function connectToNewUser(userId, stream) {
    const pc = createPeerConnection(userId);

    // Crear oferta
    pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socket.emit('offer', roomId, offer, userId);
    });
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    // Contenedor estético
    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    wrapper.appendChild(video);
    videoGrid.append(wrapper);
}

// Controles de Mute/Video
const muteBtn = document.getElementById('mute-btn');
const videoBtn = document.getElementById('video-btn');

muteBtn.addEventListener('click', () => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        muteBtn.classList.add('danger');
        muteBtn.innerHTML = `
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
            </svg>
        `;
    } else {
        audioTrack.enabled = true;
        muteBtn.classList.remove('danger');
        muteBtn.innerHTML = `
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        `;
    }
});

videoBtn.addEventListener('click', () => {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        videoBtn.classList.add('danger');
    } else {
        videoTrack.enabled = true;
        videoBtn.classList.remove('danger');
    }
});
// --- Funciones de cambio de dispositivos (Expuestas globalmente para settings.js) ---

window.changeAudioInput = async (deviceId) => {
    if (!localStream) return;
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } },
            video: false
        });

        const newAudioTrack = newStream.getAudioTracks()[0];
        const oldAudioSender = myPeerConnection?.getSenders().find(s => s.track?.kind === 'audio');

        if (oldAudioSender) {
            oldAudioSender.replaceTrack(newAudioTrack);
        }

        // Actualizar track local
        localStream.removeTrack(localStream.getAudioTracks()[0]);
        localStream.addTrack(newAudioTrack);


    } catch (err) {
        console.error('Error changing microphone:', err);
    }
};

window.changeVideoInput = async (deviceId) => {
    if (!localStream) return;
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { deviceId: { exact: deviceId } }
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        const oldVideoSender = myPeerConnection?.getSenders().find(s => s.track?.kind === 'video');

        if (oldVideoSender) {
            oldVideoSender.replaceTrack(newVideoTrack);
        }

        // Actualizar track local y video elemento
        localStream.removeTrack(localStream.getVideoTracks()[0]);
        localStream.addTrack(newVideoTrack);
        myVideo.srcObject = localStream; // Refrescar espejo local


    } catch (err) {
        console.error('Error changing camera:', err);
    }
};

window.changeAudioOutput = async (deviceId) => {
    if (!deviceId) return;

    // Aplicar a todos los elementos de video/audio remotos
    const remoteVideos = document.querySelectorAll('video:not(#myVideo)'); // Asumiendo que myVideo tiene ID o es local
    // En grid actual, los remotos se agregan dinámicamente. Necesitamos un selector robusto.
    // En addVideoStream no pusimos clase 'remote-video', deberíamos. 
    // Pero por ahora iteramos sobre todos los videos en video-grid que NO sean myVideo (que está muteado igual)

    // Mejor iteramos sobre todos los videos en el grid
    const videos = videoGrid.getElementsByTagName('video');
    for (let video of videos) {
        if (video !== myVideo && typeof video.setSinkId === 'function') {
            try {
                await video.setSinkId(deviceId);

            } catch (err) {
                console.error('Error setting audio output:', err);
            }
        }
    }
};
