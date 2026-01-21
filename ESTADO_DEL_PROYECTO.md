# Estado del Proyecto: Ligados CL

Este archivo resume la arquitectura completa y el estado actual del monorepo "Ligados CL".
**Ruta raíz:** `/Users/fabian/Documents/Proyectos HTML/ligados_cl`
**Repositorio:** `ligados_cl`

## state: ✅ LISTO PARA GITHUB / RENDER

## 🏗️ Arquitectura y Visión
El ecosistema Ligados separa estrictamente la **administración (carga de datos)** de la **visualización pública**, conectadas por una API Central.

| Componente Público | Directorio | Dominio | Descripción |
| :--- | :--- | :--- | :--- |
| **1. Academy** | `/academy` | `ligados.cl` | Landing Page institucional. |
| **2. App** | `/app` | `app.ligados.cl`| Aula Virtual (Clases, Pizarra, Piano). |
| **3. Gospel** | `/gospel` | `gospel.ligados.cl` | **Visualizador**. Corro en raíz (`/gospel`). |
| **4. Rider** | `/rider_gospel` | `rider.ligados.cl` | Generador de Rider Técnico. |
| **5. Biblioteca** | `/biblioteca` | `biblioteca.ligados.cl` | **Visualizador**. Alumnos buscan partituras. |

| Componente Admin | Directorio | Dominio | Descripción |
| :--- | :--- | :--- | :--- |
| **6. Admin Gospel** | `/admin-gospel` | `admin-gospel...` | **Gestor**. Staff sube letras/audios -> Backend. |
| **7. Admin Biblioteca** | `/admin-biblioteca` | `admin-biblioteca...` | **Gestor**. Staff sube PDFs -> Backend. |

| Backend | Directorio | Puerto | Descripción |
| :--- | :--- | :--- | :--- |
| **8. API Central** | `/backend` | `4000` | **Node.js**. Recibe archivos y guarda en `/public-uploads`. |

## 🛠️ Guía de Despliegue (Render)

### 1. Servicios Web (Node.js)
*   **App:** Root: `app`, Command: `npm start`.
*   **Backend:** Root: `backend`, Command: `npm start`. (Necesita Discos Persistentes para `/public-uploads`).

### 2. Sitios Estáticos
*   **Academy, Rider, Biblioteca, Admin-*, Gospel:**
    *   Root: `[nombre_carpeta]`
    *   Publish Directory: `.` (o `docs` en caso de Gospel si se configura build).

## 🤖 Instrucciones para el Asistente
> "Lee el archivo `ESTADO_DEL_PROYECTO.md` para recuperar el contexto."
