const GOOGLE_SHEET_CSV_URL = "";

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    let finalData = riderData;

    if (GOOGLE_SHEET_CSV_URL) {
        try {
            const csvText = await fetchCSV(GOOGLE_SHEET_CSV_URL);
            if (csvText) {
                const parsedData = parseCSVToRiderData(csvText);
                if (parsedData) {
                    finalData = parsedData;
                }
            }
        } catch (error) {
            console.error("Error loading remote data, using local fallback.", error);
        }
    }

    renderRider(finalData);
}

function renderRider(data) {
    if (data.info) {
        document.getElementById('conf-title').textContent = data.info.title || "Rider Técnico";
        document.getElementById('conf-subtitle').textContent = data.info.subtitle || "Gospel Praise";
        document.getElementById('conf-last-update').textContent = `Actualizado: ${data.info.lastUpdated || "N/A"}`;
    }

    const tbody = document.getElementById('input-list-body');
    tbody.innerHTML = '';
    if (data.inputList) {
        data.inputList.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="CH"><span class="channel-badge">${item.channel}</span></td>
                <td data-label="Instrumento" style="font-weight: 500;">${item.instrument}</td>
                <td data-label="Micrófono">${item.mic}</td>
                <td data-label="Notas" style="color: var(--secondary-text); font-size: 14px;">${item.notes}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    const monitorList = document.getElementById('monitor-list');
    monitorList.innerHTML = '';
    if (data.monitors) {
        data.monitors.forEach(mon => {
            const li = document.createElement('div');
            li.className = 'list-item';
            li.textContent = mon;
            monitorList.appendChild(li);
        });
    }

    const backlineList = document.getElementById('backline-list');
    backlineList.innerHTML = '';
    if (data.backline) {
        data.backline.forEach(item => {
            const li = document.createElement('div');
            li.className = 'list-item';
            li.textContent = item;
            backlineList.appendChild(li);
        });
    }

    const contactContainer = document.getElementById('contact-container');
    contactContainer.innerHTML = '';
    if (data.contacts) {
        data.contacts.forEach(c => {
            const card = document.createElement('div');
            card.className = 'contact-card';
            card.innerHTML = `
                <div class="contact-role">${c.role}</div>
                <div class="contact-name">${c.name}</div>
                <div><a href="tel:${c.phone}" class="contact-link">${c.phone}</a></div>
                <div><a href="mailto:${c.email}" class="contact-link">${c.email}</a></div>
            `;
            contactContainer.appendChild(card);
        });
    }

    const plotImg = document.getElementById('stage-plot-img');
    if (data.stagePlotImage && data.stagePlotImage.length > 5) {
        plotImg.src = data.stagePlotImage;
        plotImg.style.display = 'block';
    } else {
        plotImg.style.display = 'none';
    }
}

async function fetchCSV(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return await response.text();
}

function parseCSVToRiderData(csvText) {
    const lines = csvText.split(/\r?\n/);
    const newData = {
        info: {},
        inputList: [],
        monitors: [],
        backline: [],
        contacts: [],
        stagePlotImage: ""
    };

    const getCol = (arr, index) => {
        if (!arr[index]) return "";
        return arr[index].trim();
    };

    lines.forEach(line => {
        if (!line || line.trim() === '') return;

        const cols = line.split(',');
        const section = getCol(cols, 0).toUpperCase();

        if (section === 'INFO') {
            newData.info.title = getCol(cols, 1);
            newData.info.subtitle = getCol(cols, 2);
            newData.info.version = getCol(cols, 3);
            newData.info.lastUpdated = getCol(cols, 4);
        } else if (section === 'INPUT') {
            const ch = getCol(cols, 1);
            if (ch && ch !== 'COL1' && ch !== 'CANAL') {
                newData.inputList.push({
                    channel: ch,
                    instrument: getCol(cols, 2),
                    mic: getCol(cols, 3),
                    notes: getCol(cols, 4)
                });
            }
        } else if (section === 'MONITOR') {
            const mon = getCol(cols, 1);
            if (mon) newData.monitors.push(mon);
        } else if (section === 'BACKLINE') {
            const bl = getCol(cols, 1);
            if (bl) newData.backline.push(bl);
        } else if (section === 'CONTACT') {
            const role = getCol(cols, 1);
            if (role) {
                newData.contacts.push({
                    role: role,
                    name: getCol(cols, 2),
                    phone: getCol(cols, 3),
                    email: getCol(cols, 4)
                });
            }
        } else if (section === 'PLOT') {
            const url = getCol(cols, 1);
            if (url) newData.stagePlotImage = url;
        }
    });

    if (newData.inputList.length === 0) return null;
    return newData;
}
