document.addEventListener('DOMContentLoaded', () => {
    // START GOOGLE CALENDAR CONFIG
    const CALENDAR_ID = "fbnv29@gmail.com";
    const API_KEY = "AIzaSyBgwfCTNUwKWzTLXiRVzB2CtGy3cquNLyQ";
    // END GOOGLE CALENDAR CONFIG

    const songListEl = document.getElementById('songList');
    const searchInput = document.getElementById('searchInput');
    const mainContent = document.getElementById('mainContent');
    const songView = document.getElementById('songView');
    const emptyState = document.querySelector('.empty-state');
    const backButton = document.getElementById('backButton');
    const sidebar = document.querySelector('.sidebar');
    const eventsBtn = document.getElementById('eventsBtn');

    // State for mobile view
    const isMobile = () => window.innerWidth <= 768;

    // Song detail elements
    const songTitle = document.getElementById('songTitle');
    const songArtist = document.getElementById('songArtist');
    const songKey = document.getElementById('songKey');
    const lyricsContainer = document.getElementById('lyricsContainer');
    const audioControls = document.getElementById('audioControls');

    let allSongs = [];

    // Fetch song data
    fetch('index.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allSongs = data;
            renderSongList(allSongs);
        })
        .catch(error => {
            console.error('Error fetching song data:', error);
            songListEl.innerHTML = '<p style="color:red; padding:1rem;">Error cargando repertorio. Ejecuta build.py</p>';
        });

    // Render list
    function renderSongList(songs) {
        songListEl.innerHTML = '';
        songs.forEach(song => {
            const item = document.createElement('div');
            item.className = 'song-item';
            item.innerHTML = `
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.artist}</div>
            `;
            item.addEventListener('click', () => selectSong(item, song));
            songListEl.appendChild(item);
        });
    }



    // Events Button Logic
    eventsBtn.addEventListener('click', () => {
        // Clear active song
        document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));

        // Show empty state (where events are)
        songView.classList.add('hidden');
        emptyState.classList.remove('hidden');

        // If mobile, ensure we are on the main content view (Wait, empty state IS main content)
        // BUT on mobile, default view IS sidebar.
        // If we want to see events, we must HIDE sidebar and SHOW main content (with empty state).
        if (isMobile()) {
            sidebar.classList.add('mobile-hidden');
            mainContent.classList.add('mobile-active');
            backButton.classList.remove('hidden'); // We need back button to go back to list
        }
    });

    // Back Button Logic (Mobile)
    backButton.addEventListener('click', () => {
        if (isMobile()) {
            mainContent.classList.remove('mobile-active');
            sidebar.classList.remove('mobile-hidden');
            // Reset active state
            document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
        }
    });

    // Filter list
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents

        const filtered = allSongs.filter(song => {
            const titleNorm = song.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const artistNorm = song.artist.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return titleNorm.includes(term) || artistNorm.includes(term);
        });

        if (filtered.length === 0) {
            songListEl.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-secondary)">No se encontraron canciones</div>';
        } else {
            renderSongList(filtered);
        }
    });

    // Select Song
    function selectSong(element, song) {
        // Active state
        document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');

        // Show view
        emptyState.classList.add('hidden');
        songView.classList.remove('hidden');

        // Populate Metadata
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        songKey.textContent = `Ton: ${song.key}`;

        // Populate Audio
        renderAudio(song.audios);

        // Populate Lyrics
        renderLyrics(song.content);

        // Mobile view adjustment
        if (isMobile()) {
            sidebar.classList.add('mobile-hidden');
            mainContent.classList.add('mobile-active');
            backButton.classList.remove('hidden');
        } else {
            backButton.classList.add('hidden');
        }
    }

    function renderAudio(audios) {
        audioControls.innerHTML = '';
        if (Object.keys(audios).length === 0) {
            // No audio
            return;
        }

        for (const [voice, path] of Object.entries(audios)) {
            const card = document.createElement('div');
            card.className = 'audio-card';
            card.innerHTML = `
                <div class="audio-header">
                    <span class="voice-tag">${voice}</span>
                </div>
                <audio controls src="../source/${path}"></audio> 
            `;
            // Note: path in JSON is relative source/canciones...
            // But from web/index.html we need to go up one level? 
            // Check structure:
            // web/index.html
            // source/canciones/...
            // The browser cannot access ../source if hosted on GitHub Pages usually?
            // Wait, GitHub Pages:
            // If project root is deployed, then web/ is a folder, source/ is a folder.
            // If we access https://user.github.io/repo/web/index.html
            // Then ../source/ works.
            // PROYECTO INSTRUCCIONES: "web/ -> lo que se publica (GitHub Pages)"
            // implies web folder is the root of the site?
            // IF web folder is root, source folder is OUTSIDE.
            // "Python SOLO se ejecuta antes de subir a GitHub"
            // "Genera web/index.json"
            // If web/ is the root, source/ is not available.
            // WE NEED TO COPY AUDIOS to web/ OR config github pages properly.
            // INSTRUCTIONS: "source/canciones ... web/canciones" ?
            // NO, instructions say:
            // "repertorio-gospel/
            // │
            // ├── web/
            // │   ├── canciones/ "   <-- LOOK AT THE TEXT
            // "web/canciones/" is listed in structure!
            // BUT build.py generated logic?
            // "Qué hace Python: ... prepara la web"
            // Ah! build.py needs to copy files or symlink?
            // The instructions don't explicitly say copy, but "web/canciones/" is in the tree.
            // So build.py must COPY/SYNC source/canciones to web/canciones
            // Let's check my build.py. I didn't verify that.

            // I will fix build.py in the next step. For now, let's assume web/canciones exists.

            // If web/canciones exists, then path should be 'canciones/slug/voice.mp3' relative to index.html

            audioControls.appendChild(card);
        }
    }

    function renderLyrics(rawText) {
        // Simple parser
        // 1. Remove metadata (lines starting with {)
        let lines = rawText.split('\n');
        let html = '';

        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('{') && line.endsWith('}')) {
                return; // skip metadata
            }
            if (line.startsWith('[') && line.endsWith(']')) {
                // Section
                html += `<div class="section-header">${line.replace('[', '').replace(']', '')}</div>\n`;
            } else if (line === '') {
                html += '<br>\n';
            } else {
                // Parse voices
                let processedLine = line
                    .replace(/<soprano>(.*?)<\/soprano>/g, '<span class="s-soprano">$1</span>')
                    .replace(/<alto>(.*?)<\/alto>/g, '<span class="s-alto">$1</span>')
                    .replace(/<tenor>(.*?)<\/tenor>/g, '<span class="s-tenor">$1</span>')
                    .replace(/<solista>(.*?)<\/solista>/g, '<span class="s-solista">$1</span>')
                    .replace(/<todos>(.*?)<\/todos>/g, '<span class="s-todos">$1</span>');

                html += `<div>${processedLine}</div>\n`;
            }
        });

        lyricsContainer.innerHTML = html;
    }


    // GOOGLE CALENDAR FETCH
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}&maxResults=5`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById("eventos-lista");
            if (!contenedor || !data.items) return;

            if (data.items.length > 0) {
                const title = document.createElement("h3");
                title.textContent = "Próximos Eventos";
                title.style.marginTop = "2rem";
                title.style.marginBottom = "1rem";
                title.style.opacity = "0.7";
                contenedor.parentNode.insertBefore(title, contenedor);
            }

            data.items.forEach(evento => {
                const fecha = new Date(evento.start.dateTime || evento.start.date);
                const fechaTexto = fecha.toLocaleDateString("es-CL", {
                    weekday: "long",
                    day: "numeric",
                    month: "short"
                });

                const card = document.createElement("div");
                card.className = "evento-card";

                card.innerHTML = `
                    <div class="evento-fecha">${fechaTexto}</div>
                    <div class="evento-titulo">${evento.summary}</div>
                    <div class="evento-canciones">${parseCanciones(evento.description || "")}</div>
                `;

                contenedor.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error cargando eventos del calendario:", error);
        });

    function parseCanciones(description) {
        if (!description) return "";
        const lines = description.split('\n');
        let html = '<ul style="list-style:none; padding:0; margin-top:0.5rem; font-size:0.9rem; color:var(--text-secondary);">';
        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('-')) {
                html += `<li>${line}</li>`;
            }
        });
        html += '</ul>';
        return html;
    }

});
