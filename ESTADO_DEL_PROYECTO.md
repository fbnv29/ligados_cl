# Estado del Proyecto: Ligados CL

Este archivo resume el estado actual y la estructura del proyecto "Ligados CL" para facilitar la restauración del contexto en futuras sesiones con el asistente.

## 📂 Estructura General
Ruta raíz: `/Users/fabian/Documents/Proyectos HTML/ligados_cl`

El proyecto funciona como un monorepo que agrupa varias aplicaciones relacionadas con la música y la gestión educativa/gospel.

### 1. 🎹 App Ligados Online (`/app`)
Plataforma web para clases de música remotas.
- **Tecnologías:** Node.js, Express, Socket.IO, WebRTC, Web MIDI API.
- **Estado:** En desarrollo activo.
- **Características Clave:**
  - Videollamada integrada.
  - Pizarra interactiva (Whiteboard) tipo Excalidraw Sincronizada.
  - Piano Virtual MIDI sincronizado entre profesor y alumno.
- **Comandos:**
  - `npm run dev` (Inicia servidor en puerto 3000).

### 2. 🎼 Repertorio Gospel (`/gospel`)
Sistema de gestión y visualización de canciones para coro.
- **Estructura:**
  - `source/`: Fuente de verdad (letras en .txt y audios .mp3).
  - `tools/`: Scripts en Python (`build.py`, `validate.py`) para generar la web.
  - `docs/`: Sitio web estático generado (build target).
- **Flujo de Trabajo:**
  - Agregar canción en `source/canciones/`.
  - Crear `letra.txt` con metadata.
  - Ejecutar `python tools/build.py`.

### 3. 📋 Rider Gospel (`/rider_gospel`)
Generador de Rider Técnico con estética Apple.
- **Tecnologías:** HTML, CSS, JS plano.
- **Datos:** Se alimenta de `data.js` o CSV (`plantilla_rider.csv`).

## 🔄 Contexto Reciente (Historial)
- **App:** Se ha trabajado en refinar el layout de `room.html`, mejorando la disposición de la cámara y la pizarra, y asegurando que sea responsive.
- **Gospel:** Se documentó el proceso de "Cómo agregar canciones" y se estandarizó el uso de scripts de Python para la actualización.
- **General:** Limpieza para preparación de GitHub y mejoras de UI.

## 🤖 Instrucciones para el Asistente
Cuando inicies una nueva sesión, pídele al asistente:
> "Lee el archivo `ESTADO_DEL_PROYECTO.md` para recuperar el contexto."
