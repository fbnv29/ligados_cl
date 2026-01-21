const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000; // Puerto diferente a la App (3000)

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de almacenamiento (Multer)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Carpeta donde se guardarán los archivos
        // En un entorno de producción real, esto podría ser S3 o un volumen persistente
        const uploadPath = path.join(__dirname, '../public-uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Nombre único + extensión original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rutas
app.get('/', (req, res) => {
    res.send('Ligados API v1.0 - Online');
});

// Endpoint para subir partituras (Admin Biblioteca)
app.post('/api/upload/score', upload.single('pdfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Aquí guardaríamos los metadatos (título, instrumento) en una "Base de Datos" (o JSON por ahora)
    const { title, instrument, level } = req.body;

    console.log('Nueva partitura recibida:', {
        title, instrument, level,
        filename: req.file.filename
    });

    res.json({
        message: 'Archivo subido exitosamente',
        file: req.file.filename,
        data: { title, instrument, level }
    });
});

// Endpoint para listar partituras (Biblioteca Pública)
// En el futuro, esto leería del JSON/DB
app.get('/api/scores', (req, res) => {
    // Mock data
    res.json([
        { id: 1, title: 'Sonata Ejemplo', instrument: 'piano', level: 3, file: 'example.pdf' }
    ]);
});

// Endpoint para subir Canciones Gospel (Admin Gospel)
app.post('/api/upload/song', upload.single('audioFile'), (req, res) => {
    // Nota: audioFile es opcional, puede venir solo letra
    const { title, artist, key, bpm, lyrics } = req.body;
    const audioFilename = req.file ? req.file.filename : null;

    console.log('Nueva canción recibida:', {
        title, artist, key,
        audio: audioFilename
    });

    // TODO: Aquí guardaríamos el .txt o actualizaríamos el index.json de Gospel

    res.json({
        message: 'Canción subida exitosamente',
        data: { title, artist, audioFilename }
    });
});

app.listen(PORT, () => {
    console.log(`Backend API escuchando en http://localhost:${PORT}`);
});
