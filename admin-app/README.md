# API_TJ Admin

PWA administrativa para operar el backoffice de `API_TJ` sobre la API existente bajo `/api/v1`.

## Stack

- React
- Vite
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- MUI
- vite-plugin-pwa

## Setup local

```bash
npm install
copy .env.example .env
npm run dev
```

En PowerShell con politicas restrictivas usa `npm.cmd` en lugar de `npm`.

## Variables de entorno

- `VITE_API_BASE_URL`: base URL del backend admin. En local puede quedarse como `/api/v1` para usar el proxy de Vite hacia `http://127.0.0.1:8081`. En Render debe ser la URL publica real del backend, por ejemplo `https://apitj-production.up.railway.app/api/v1`.
- `VITE_APP_NAME`: nombre visible de la app.
- `VITE_SESSION_STORAGE_KEY`: key usada para persistir el token en `sessionStorage`.

## Deploy en Render

Este proyecto ya incluye:

- `render.yaml` en la raiz del repo para crear un Static Site desde la carpeta `admin-app`.
- Regla de rewrite SPA para que las rutas de React Router funcionen al recargar o abrir URLs directas.

### Paso a paso

1. Verifica que el backend ya este publicado y acepte peticiones desde el dominio que te dara Render.
2. En local, dentro de `admin-app`, instala dependencias con `npm install`.
3. Crea tu archivo `.env` si quieres probar antes del deploy y define:

```env
VITE_API_BASE_URL=https://apitj-production.up.railway.app/api/v1
VITE_APP_NAME=API_TJ Admin
VITE_SESSION_STORAGE_KEY=api_tj_admin_session
```

4. Prueba el build local:

```bash
npm run build
```

5. Sube este proyecto a GitHub, GitLab o Bitbucket si todavia no esta versionado.
6. En Render, elige `New` > `Static Site`.
7. Conecta tu repositorio y selecciona la rama a desplegar.
8. Si Render detecta el `render.yaml`, acepta la configuracion. Si prefieres capturarla manualmente, usa estos valores:

```txt
Root Directory: admin-app
Build Command: npm run build
Publish Directory: dist
```

9. En `Environment variables` agrega:

```txt
VITE_API_BASE_URL = https://apitj-production.up.railway.app/api/v1
VITE_APP_NAME = API_TJ Admin
VITE_SESSION_STORAGE_KEY = api_tj_admin_session
```

10. Lanza el primer deploy.
11. Cuando termine, abre la URL publicada y valida login, dashboard y navegacion directa a rutas como `/dashboard` o `/usuarios`.

### Importante

- En produccion no dejes `VITE_API_BASE_URL=/api/v1` a menos que tambien configures un proxy real en el mismo dominio. En Render, por defecto, ese proxy no existe.
- Si el backend esta en otro dominio, debe permitir CORS para el dominio de Render y aceptar al menos los headers `Authorization` y `Content-Type`.
- Al probar `https://apitj-production.up.railway.app/api/v1/admin/session` no observe un header `Access-Control-Allow-Origin`, asi que probablemente debas habilitar CORS en Railway antes de que el login funcione desde el navegador.
- La app consume estos endpoints sobre la base configurada: `POST /admin/auth/login`, `GET /admin/session`, `POST /admin/auth/logout`.

## Deploy en Vercel

Este proyecto tambien incluye `vercel.json` dentro de `admin-app` con dos rewrites:

- `/api/:path*` se proxya a `https://apitj-production.up.railway.app/api/:path*`
- cualquier otra ruta se reescribe a `/index.html` para que React Router funcione al recargar

Con eso, en Vercel puedes dejar `VITE_API_BASE_URL=/api/v1` y evitar CORS en el navegador porque las peticiones salen al mismo dominio de la app y Vercel las reenvia al backend.

### Valores sugeridos en Vercel

```txt
Root Directory: admin-app
Build Command: npm run build
Output Directory: dist
```

### Variables de entorno recomendadas

```txt
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=API_TJ Admin
VITE_SESSION_STORAGE_KEY=api_tj_admin_session
```

### Nota

- Si prefieres no usar el rewrite de Vercel, entonces `VITE_API_BASE_URL` debe apuntar a la URL publica completa del backend y Railway tendra que permitir CORS desde tu dominio de Vercel.

## Contratos canonicos

- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/session`
- `POST /api/v1/admin/auth/logout`

## Reglas de sesion

- Sin refresh token
- Token en memoria y copia en `sessionStorage`
- Rehidratacion con `GET /api/v1/admin/session`
- Cualquier `401` limpia sesion y redirige a login

## Modulos MVP

- Login
- Dashboard
- Convenios
- Usuarios internos
- Beneficiarios staging
