# Guía Paso a Paso: Desplegar en Render 🚀

Esta guía te llevará de la mano para subir tus aplicaciones de **Ligados** a Internet usando [Render.com](https://render.com).

## 1. Preparativos
1.  Crea una cuenta en [dashboard.render.com](https://dashboard.render.com/).
2.  Haz clic en el botón **"New +"** y selecciona las opciones según el tipo de servicio (ver abajo).
3.  Conecta tu cuenta de GitHub y selecciona el repositorio **`ligados_cl`**.

> 🚨 **IMPORTANTE: EL CONCEPTO CLAVE**
> Tu repositorio es como un edificio con varios departamentos (`app`, `backend`, `gospel`).
> En Render, debes crear un "Servicio" por cada departamento.
> 
> **Si te sale "Error 127"**, es porque Render intentó entrar al edificio (raíz) pero no le dijiste a qué puerta (carpeta) ir.
> **Solución:** Asegúrate de llenar el campo **"Root Directory"** en la configuración de Render.

---

## 2. Desplegar el Backend (API)
*Este es el cerebro. Despliégalo primero para obtener la URL que usarán las otras apps.*

1.  Nuevo **Web Service**.
2.  Repo: `ligados_cl`.
3.  **Name:** `ligados-backend` (o similar).
4.  **Language:** Node.
5.  **Root Directory:** `backend.` (⚠️ Muy importante).
6.  **Build Command:** `npm install`.
7.  **Start Command:** `node index.js`.
8.  **Plan:** Free.
9.  Click **Create Web Service**.

> 📝 **Nota:** Render te dará una URL (ej: `https://ligados-backend.onrender.com`). Guárdala, la necesitaremos para conectar los formularios.

---

## 3. Desplegar la App Principal (Clases)
*Tu aula virtual.*

1.  Nuevo **Web Service**.
2.  Repo: `ligados_cl`.
3.  **Name:** `ligados-app`.
4.  **Language:** Node.
5.  **Root Directory:** `app` (⚠️).
6.  **Build Command:** `npm install`.
7.  **Start Command:** `npm start` (o `node server.js`).
8.  Click **Create Web Service**.

---

## 4. Desplegar Sitios Estáticos (Visualizadores y Portales)
*Repite estos pasos para cada uno de los sitios (Academy, Gospel, Biblioteca, Riders, Admins).*

El proceso es igual para todos, solo cambia el **Root Directory**.

**Pasos Generales:**
1.  Nuevo **Static Site**.
2.  Repo: `ligados_cl`.
3.  **Name:** (Ej: `ligados-gospel`, `ligados-academy`...).
4.  **Build Command:** (Déjalo vacío, a menos que se indique lo contrario).
5.  **Publish Directory:** `.` (Punto).
6.  **Root Directory:** (Ver tabla abajo 👇).

| Sitio a Desplegar | Root Directory | Publish Directory |
| :--- | :--- | :--- |
| **Academy** | `academy` | `.` |
| **Gospel** | `gospel` | `.` |
| **Rider** | `rider_gospel` | `.` |
| **Biblioteca** | `biblioteca` | `.` |
| **Admin Biblioteca** | `admin-biblioteca` | `.` |
| **Admin Gospel** | `admin-gospel` | `.` |

---

## 5. Configuración de Dominios (Opcional)
Una vez desplegados, Render te dará dominios tipo `ligados-gospel.onrender.com`.
Si compraste `ligados.cl`, ve a la pestaña **Settings > Custom Domains** de cada servicio en Render y escribe el subdominio que quieras:

*   App -> `app.ligados.cl`
*   Gospel -> `gospel.ligados.cl`
*   etc.

Render te dará las instrucciones DNS (CNAME) para poner en tu proveedor de dominio (NIC Chile / Godaddy / etc).
