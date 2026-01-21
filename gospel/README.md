# REPERTORIO GOSPEL

Este proyecto gestiona el repertorio de un coro Gospel, separando la fuente de datos (letras/audios) de la presentación web.

## Estructura

- `docs/`: Contiene el sitio web generado (listo para publicar en GitHub Pages).
- `source/`: Canciones (letras y audios).
- `tools/`: Scripts de Python para validar y construir el sitio.

## Cómo agregar una canción

1. Crea una carpeta en `source/canciones/` (ej: `santo-por-siempre`).
2. Agrega el archivo `letra.txt` con la metadata y letra (ver formato).
3. (Opcional) Agrega los audios `.mp3` para cada voz.
4. Ejecuta `python tools/build.py` para actualizar la web.
5. Sube los cambios a GitHub.

## Scripts

- `python tools/build.py`: Genera `web/index.json` con todas las canciones.
- `python tools/validate.py`: Valida que las canciones cumplan el formato.
