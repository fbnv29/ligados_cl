# 📖 Manual de Uso - Rider Técnico Web
**Gospel Praise Concepción**

Este es un Rider Técnico interactivo, diseñado para ser elegante (estilo Apple) y muy fácil de actualizar sin tocar código complejo.

---

## 🚀 Inicio Rápido

1.  Abre la carpeta del proyecto.
2.  Haz doble clic en **`index.html`**.
3.  ¡Listo! Verás tu Rider Técnico en el navegador.

---

## ☁️ Opción A: Actualizar con Google Sheets (Recomendado)

Esta es la forma más fácil. Puedes editar tu Rider desde cualquier lugar usando Excel/Google Sheets.

### 1. Preparar la Hoja
1.  Sube el archivo **`plantilla_rider.csv`** a tu Google Drive.
2.  Ábrelo con **Google Sheets**.
3.  Edita lo que quieras:
    *   **Añadir canales**: Simplemente escribe una nueva fila debajo de la última.
    *   **Borrar canales**: Elimina la fila completa.
    *   **Cambiar datos**: Modifica nombres, micrófonos, etc.

### 2. Conectar a la Web
1.  En Google Sheets, ve a **Archivo > Compartir > Publicar en la web**.
2.  En "Enlace", selecciona **"Todo el documento"** y **"Valores separados por comas (.csv)"**.
3.  Haz clic en **Publicar** y copia el enlace que te da.
4.  Abre el archivo **`script.js`** en tu computadora (con Bloc de Notas o VS Code).
5.  Pega el enlace en la primera línea:
    ```javascript
    const GOOGLE_SHEET_CSV_URL = "PEGA_AQUI_TU_ENLACE";
    ```
6.  Guarda el archivo. ¡Ahora tu web se actualizará automáticamente cuando cambies la hoja!

---

## 💻 Opción B: Edición Manual (Sin Internet)

Si prefieres no usar Google Sheets, puedes editar los datos directamente en el archivo `data.js`.

1.  Abre **`data.js`** con un editor de texto.
2.  Verás la lista de canales así:
    ```javascript
    { channel: "01", instrument: "Bombo", mic: "Shure Beta 52", notes: "Gate" },
    ```
3.  Cambia el texto que está entre comillas.
4.  Guarda y refresca la página `index.html`.

---

## 🖨️ Cómo Imprimir o Guardar PDF

1.  En la página web, verás un **botón flotante** en la esquina inferior derecha.
2.  Haz clic en él.
3.  Se abrirá el menú de impresión.
4.  En "Destino", selecciona **"Guardar como PDF"**.
5.  El diseño se ajustará automáticamente para quedar perfecto en papel (blanco y negro, sin sombras).

---

## 🗺️ Cambiar la Imagen del Stage Plot

1.  Guarda tu imagen del escenario (JPG o PNG) en esta misma carpeta.
2.  Si usas **Google Sheets**: En la sección `PLOT` de la hoja, pega el nombre del archivo (ej: `mi_escenario.jpg`).
3.  Si usas **data.js**: Busca `stagePlotImage` y pon el nombre del archivo:
    ```javascript
    stagePlotImage: "./mi_escenario.jpg"
    ```
