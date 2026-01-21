# Guía de Migración a Netlify

Sigue estos pasos para activar el usuario y contraseña (`fabian` / `123456`) y publicar tu sitio.

## 1. Crear Sitio en Netlify
1.  Ve a [netlify.com](https://www.netlify.com/) y crea una cuenta gratis (Login with GitHub).
2.  Haz clic en **"Add new site"** -> **"Import an existing project"**.
3.  Selecciona **GitHub**.
4.  Busca tu repositorio: `GOSPEL-V2`.
5.  En la configuración de "Build":
    *   **Publish directory**: `docs` (Esto es muy importante).
    *   Deja el resto como está.
6.  Haz clic en **"Deploy site"**.

## 2. Activar "Identity" (Usuarios)
1.  Una vez creado el sitio, ve a la pestaña **"Site configuration"** (o "Settings").
2.  Busca **"Identity"** en el menú lateral.
3.  Haz clic en **"Enable Identity"**.
4.  En "Registration preferences", asegúrate que esté en "Open" o "Invite only" (mejor invitar solo a tus coristas).
5.  Ve a "Services" -> **"Git Gateway"** -> **"Enable Git Gateway"** (esto conecta los usuarios con tu GitHub).

## 3. Crear tu Usuario
1.  En la pestaña Identity, haz clic en **"Invite users"**.
2.  Invítate a ti mismo con tu email.
3.  Te llegará un correo. Haz clic en el enlace para aceptar la invitación.
4.  Ahí podrás definir tu contraseña (ej: `123456`).

## 4. ¡Listo!
Ahora entra a tu sitio web nuevo (Netlify te dará una URL tipo `gospel-v2.netlify.app/admin`).
Verás el botón de login, y podrás entrar con tu email y contraseña.

---

**Nota Importante**: Si quieres seguir usando tu dirección de GitHub (`tusuario.github.io`), puedes configurarlo, pero lo más fácil es usar la dirección que te da Netlify.
