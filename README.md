# MVP — Frontend Admin Panel (Tarjeta Joven)

Este documento define el **MVP del Frontend del Panel de Administración** para Tarjeta Joven.  
Especifica **pantallas**, **rutas**, **componentes**, **flujos**, **validaciones**, **roles** y **endpoints consumidos** para que el equipo de desarrollo implemente sin ambigüedades.

---

## 1) Objetivo del Admin Panel (MVP)

Permitir que el Administrador (dependencia pública) controle todo el ecosistema:

1. **Tiendas**
   - Alta manual (por convenio)
   - Activar/desactivar
   - Edición de información

2. **Promociones (beneficios) por tienda**
   - Alta/edición
   - Coins otorgados por promoción (múltiplos de 5)
   - Vigencia
   - Activar/desactivar

3. **Eventos / Rifas**
   - Crear evento con flyer + descripción + costo por boleto (múltiplos de 5)
   - Definir tiendas participantes (manual / random / por categoría)
   - Publicar (activar) / cerrar
   - Ejecutar sorteo y ver ganador

4. **Métricas mínimas**
   - Cards del dashboard
   - (Opcional) Reportes básicos

---

## 2) Alcance del MVP

### Incluye
- Autenticación de Admin
- Dashboard con métricas simples
- CRUD tiendas
- CRUD promociones por tienda
- CRUD eventos/rifas
- Gestión de participantes del evento
- Ejecutar sorteo
- Ver ganador

### Excluye (por ahora)
- Gestión avanzada de usuarios/admins
- Exportaciones (CSV/PDF)
- Workflows de aprobación complejos
- Branding por tienda
- Auditoría avanzada en UI (queda en backend/logs)

---

## 3) Roles y permisos

**Rol requerido:** `admin`  
El Admin Panel asume que todos los endpoints están protegidos por JWT y que el usuario autenticado tiene rol admin.

---

## 4) Stack y convenciones (recomendado)

- React + TypeScript + Vite
- React Router
- Estado: Zustand o Redux Toolkit (uno)
- UI: Tailwind + Headless UI / Radix (o equivalente)
- Formularios: React Hook Form + Zod (recomendado)
- Notificaciones: Toast/Snackbar
- Manejo sesión:
  - `Authorization: Bearer <accessToken>`
  - Si `401` ⇒ limpiar sesión y redirigir a `/admin/login`

---

## 5) Variables de entorno (Admin)

- `VITE_API_URL` (base del backend, ej. `/api/v1` o `https://.../api/v1`)
- `VITE_SENTRY_DSN` (opcional)
- `VITE_SENTRY_RELEASE` (opcional)
- `VITE_ANALYTICS_URL` (opcional)
- `VITE_ADMIN_TITLE` (opcional)

---

## 6) Rutas (routing) — Admin Panel

### Públicas
- `/admin/login`

### Privadas (requieren sesión)
- `/admin` (Dashboard)
- `/admin/tiendas`
- `/admin/tiendas/nueva`
- `/admin/tiendas/:storeId/editar`
- `/admin/tiendas/:storeId/promociones`
- `/admin/tiendas/:storeId/promociones/nueva`
- `/admin/promociones/:promotionId/editar`
- `/admin/eventos`
- `/admin/eventos/nuevo`
- `/admin/eventos/:eventId`
- `/admin/eventos/:eventId/editar`
- `/admin/eventos/:eventId/participantes`
- `/admin/eventos/:eventId/sorteo`
- `/admin/reportes` (opcional MVP)

---

## 7) Pantallas MVP (detalle funcional)

### 7.1 Login Admin
**Objetivo:** Iniciar sesión como administrador.

**UI mínimo**
- Input: usuario (email/username)
- Input: contraseña
- Botón: “Iniciar sesión”
- Estado loading + manejo de error

**Acción**
- `POST /auth/login`

**Criterios de aceptación**
- Guarda tokens y navega a `/admin`
- Si error, muestra mensaje y no navega

---

### 7.2 Dashboard
**Objetivo:** Vista rápida del estado del sistema.

**Cards mínimas (MVP)**
- Tiendas activas
- Promociones activas
- Eventos activos
- Coins otorgados hoy (si existe métrica)
- Boletos vendidos hoy / por evento (si existe métrica)

**Data source**
- (Ideal) `GET /admin/metrics/summary`
- (MVP alterno) derivar de listados `/stores`, `/events` y contadores simples

**Acciones rápidas**
- Botón: “Crear tienda”
- Botón: “Crear evento”

---

### 7.3 Tiendas — Listado
**Objetivo:** Administrar tiendas.

**Tabla/Listado**
- Nombre
- Categoría
- Municipio
- Estatus (activo/inactivo)
- Acciones: Editar, Activar/Desactivar, Ver Promociones

**Filtros**
- Municipio (opcional)
- Categoría (opcional)
- Estatus (activo/inactivo)

**Acciones**
- `GET /stores`
- `PATCH /stores/:id/status`

**Criterios de aceptación**
- Cambiar estatus pide confirmación
- Estado se refleja al refrescar listado

---

### 7.4 Tiendas — Alta/Edición
**Objetivo:** Crear o editar una tienda.

**Formulario**
- Nombre (required)
- Categoría (required)
- Municipio (required)
- Dirección (optional)
- Estatus (toggle opcional)

**Validaciones**
- Required fields
- Longitudes razonables

**Acciones**
- Crear: `POST /stores`
- Editar: `PUT /stores/:id`

---

### 7.5 Promociones — Listado por Tienda
**Objetivo:** Administrar promociones (beneficios) de una tienda.

**Tabla/Listado**
- Título
- Coin reward
- Vigencia
- Estatus
- Acciones: Editar, Activar/Desactivar

**Acciones**
- `GET /stores/:storeId/promotions`
- `PATCH /promotions/:id/status`

---

### 7.6 Promociones — Alta/Edición
**Objetivo:** Crear o editar promoción.

**Formulario**
- Título (required)
- Descripción (optional)
- Coin reward (required) — **múltiplo de 5**
- Vigencia (startsAt, endsAt) (optional)
- Estatus (toggle)

**Validación clave**
- `coin_reward % 5 == 0`
  - Mensaje: “El valor debe ser múltiplo de 5.”

**Acciones**
- Crear: `POST /stores/:storeId/promotions`
- Editar: `PUT /promotions/:id`

---

### 7.7 Eventos/Rifas — Listado
**Objetivo:** Administrar eventos.

**Tabla/Listado**
- Título
- Estatus (draft/active/closed/drawn/archived)
- Vigencia
- Costo boleto (coins)
- Acciones: Ver, Editar, Participantes, Sorteo

**Acciones**
- `GET /events` (admin puede ver todos; si el endpoint público filtra, usar endpoint admin)

---

### 7.8 Eventos/Rifas — Crear/Editar
**Objetivo:** Crear o editar una rifa.

**Formulario**
- Título (required)
- Descripción (required)
- Flyer (file upload o URL) (required para MVP visual)
- Costo boleto (ticket_cost_coins) (required) — **múltiplo de 5**
- Fechas: startsAt / endsAt (required)
- Estatus: draft/active (admin lo define)

**Validaciones**
- `ticket_cost_coins % 5 == 0`
- `startsAt < endsAt`

**Acciones**
- Crear: `POST /events`
- Editar: `PUT /events/:id`

---

### 7.9 Participantes (Tiendas por Evento)
**Objetivo:** Definir tiendas participantes.

**Modos**
1) Manual:
- Selector múltiple de tiendas
- `POST /events/:id/stores` `{ storeIds: [] }`

2) Random:
- Botón “Seleccionar aleatoriamente”
- Inputs opcionales:
  - cantidad (N)
  - criterio (por categoría/municipio)
- `POST /events/:id/stores/randomize`

3) Por categoría:
- Dropdown categoría
- Seleccionar todas las tiendas activas de esa categoría y confirmación

**Criterios de aceptación**
- Debe mostrarse lista final de participantes
- Debe poder reconfigurar mientras evento esté `draft` (recomendado MVP)

---

### 7.10 Sorteo
**Objetivo:** Ejecutar sorteo y registrar ganador.

**UI mínimo**
- Card con estado del evento (boletos vendidos)
- Botón: “Ejecutar sorteo”
  - Confirm modal: “Esto no se puede revertir”
- Resultado:
  - Ganador (enmascarado si es necesario)
  - Fecha/hora
  - Método random

**Acción**
- `POST /events/:id/draw`

**Criterios de aceptación**
- Una vez sorteado, el UI lo marca como `drawn`
- No permite ejecutar sorteo otra vez (o muestra warning)

---

## 8) Componentes clave (reutilizables)

- `AdminLayout` (sidebar + topbar)
- `ProtectedRoute`
- `DataTable`
- `ConfirmDialog`
- `ToastProvider`
- `StoreForm`
- `PromotionForm`
- `EventForm`
- `ParticipantsManager`
- `DrawWinnerCard`

---

## 9) Manejo de errores (estándar)

- `401`: limpiar sesión, redirigir a `/admin/login`
- `403`: mostrar “No autorizado”
- `400/422`: mostrar `message` en formulario
- `409`: mostrar conflicto (ej. evento ya sorteado)

---

## 10) Endpoints consumidos (Admin)

### Auth
- `POST /auth/login`
- (opcional) `POST /auth/logout`

### Stores
- `POST /stores`
- `GET /stores`
- `GET /stores/:id`
- `PUT /stores/:id`
- `PATCH /stores/:id/status`

### Promotions
- `POST /stores/:storeId/promotions`
- `GET /stores/:storeId/promotions`
- `PUT /promotions/:id`
- `PATCH /promotions/:id/status`

### Events
- `GET /events` (admin)
- `POST /events`
- `GET /events/:id`
- `PUT /events/:id`
- `POST /events/:id/stores`
- `POST /events/:id/stores/randomize`
- `POST /events/:id/draw`

### Metrics (opcional)
- `GET /admin/metrics/summary`
- `GET /admin/reports/top-stores`
- `GET /admin/reports/top-users`

---

## 11) Definición de listo (DoD) — Admin Panel MVP

- [ ] Login funciona y persiste sesión
- [ ] CRUD tiendas (crear, listar, editar, activar/desactivar)
- [ ] CRUD promociones por tienda (incluye validación múltiplos de 5)
- [ ] CRUD eventos (incluye flyer y costo boleto múltiplo de 5)
- [ ] Gestión de participantes por evento (manual y random al menos)
- [ ] Ejecutar sorteo con confirmación y visualización de ganador
- [ ] Manejo correcto de errores y 401

---

## 12) Entregables esperados (para PR)
- Rutas + layouts
- Cliente API (services) + tipos
- Formularios con validaciones
- Pantallas implementadas
- Documentación actualizada

---

Documento oficial: MVP Frontend Admin Panel — Tarjeta Joven.
