# IXF — Infrastructure Exchange Framework

Sistema de gestión de máquinas virtuales con panel de control en tiempo real, roles diferenciados (Admin / Cliente) y sincronización live vía WebSockets.

---

## Tabla de contenidos

1. [Arquitectura del sistema](#arquitectura-del-sistema)
2. [Decisiones técnicas](#decisiones-técnicas)
3. [Estructura de carpetas](#estructura-de-carpetas)
4. [Guía de instalación local](#guía-de-instalación-local)
5. [Credenciales de prueba](#credenciales-de-prueba)
6. [Bitácora de IA](#bitácora-de-ia)

---

## Arquitectura del sistema

### Diagrama de interacción

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR  (SPA)                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React 19  ·  React Router 7  ·  Cookie Auth (Sanctum)      │   │
│  │                                                              │   │
│  │   AuthContext          VmContext                             │   │
│  │   ├─ user              ├─ vms[]                              │   │
│  │   ├─ isAdmin           ├─ create / update / remove           │   │
│  │   └─ isClient          └─ listeners (WS)                     │   │
│  └──────────────┬─────────────────────────┬─────────────────────┘   │
│                 │  HTTP / REST             │  WebSocket               │
│         credentials:include               │  private-vms channel     │
└─────────────────┼─────────────────────────┼─────────────────────────┘
                  │                         │
     ┌────────────▼────────────┐   ┌────────▼─────────────────────┐
     │   Laravel 13  API       │   │  Laravel Reverb              │
     │   puerto 8000           │   │  puerto 8080                 │
     │                         │   │                              │
     │  /api/login             │   │  Eventos broadcast:          │
     │  /api/register          │   │  · VmCreated                 │
     │  /api/user              │   │  · VmUpdated                 │
     │  /api/vms  (CRUD)       │   │  · VmDeleted                 │
     │  /api/broadcasting/auth │   │                              │
     │                         │   │  Auth: POST /broadcasting/   │
     │  Sanctum (cookie SPA)   │   │  auth  → valida sesión       │
     │  Spatie Permissions     │   │                              │
     │  SQLite                 │   └──────────────────────────────┘
     └─────────────────────────┘
```

### Flujo de autenticación

```
Browser                     Laravel API                  Base de datos
   │                             │                             │
   │── GET /sanctum/csrf-cookie ─►│                             │
   │◄─ Set-Cookie: XSRF-TOKEN ───│                             │
   │                             │                             │
   │── POST /api/login ──────────►│── Auth::attempt() ─────────►│
   │   X-XSRF-TOKEN header        │◄─ user + session ───────────│
   │◄─ Set-Cookie: laravel-session│                             │
   │   JSON: { id, name, roles }  │                             │
   │                             │                             │
   │  (cada request siguiente)    │                             │
   │── GET /api/user ────────────►│── EnsureFrontendRequests    │
   │   Cookie: laravel-session    │   AreStateful               │
   │◄─ 200 { user data } ────────│── auth:sanctum guard ───────►│
```

### Flujo de tiempo real

```
Admin crea VM                                              Cliente conectado
     │                                                           │
     │── POST /api/vms ──►  VmController::store()               │
     │                           │                              │
     │                       VmCreated::dispatch($vm)            │
     │                           │ (ShouldBroadcastNow)         │
     │                           │                              │
     │                       Reverb (WS server)                 │
     │                           │── broadcast → private-vms ──►│
     │                           │                         VmContext listener
     │                           │                         setVms([newVm, ...])
     │◄── 201 { vm } ───────────│                         UI actualiza sin reload
```

---

## Decisiones técnicas

### Backend — Laravel 13 + Sanctum

**¿Por qué Laravel?** Framework maduro con ORM, políticas de autorización, sistema de broadcasting y manejo de sesiones integrado. Permite ir de cero a una API segura con roles en poco tiempo.

**¿Por qué Sanctum (cookie) en lugar de tokens?** Para SPAs en el mismo dominio/subdominio, la autenticación por cookie de sesión es más segura: no expone tokens en `localStorage` (vulnerable a XSS) y el CSRF está gestionado automáticamente.

**¿Por qué Spatie Laravel Permission?** Desacopla roles de permisos granulares. Un `admin` tiene `vm.create`, `vm.update`, `vm.delete`; un `client` solo `vm.viewAny` y `vm.view`. Esto permite escalar el modelo de acceso sin tocar código de controladores.

**¿Por qué SQLite?** Cero configuración para desarrollo local. En producción se cambia una variable de entorno (`DB_CONNECTION=pgsql`) sin tocar código.

**¿Por qué Reverb en lugar de Pusher?** Reverb es el servidor WebSocket oficial de Laravel, self-hosted, sin límites de mensajes ni costos externos. Ideal para demo y producción propia.

**`ShouldBroadcastNow` en lugar de `ShouldBroadcast`** Los eventos se envían de forma síncrona durante el request HTTP, eliminando la necesidad de correr un queue worker por separado en desarrollo.

### Frontend — React 19 + Vite

**¿Por qué React 19?** API de contexto simplificada (`use(Context)` en lugar de `useContext`), mejor rendimiento en renders concurrentes y soporte nativo de Server Actions (no usado aquí pero futuro).

**¿Por qué Context API y no Redux/Zustand?** El estado global es limitado: usuario autenticado + lista de VMs. Context es suficiente y evita dependencias extra. Si el proyecto crece, Zustand puede adoptarse sin refactor total.

**¿Por qué fetch nativo y no Axios?** Menos dependencias, API estándar del navegador. El wrapper en `lib/api.js` centraliza headers, manejo de 401 y CSRF en ~40 líneas.

---

## Estructura de carpetas

```
IXF/
├── backend/                     # Laravel 13 API
│   ├── app/
│   │   ├── Events/              # VmCreated, VmUpdated, VmDeleted (broadcast)
│   │   ├── Http/
│   │   │   ├── Controllers/API/ # AuthController, VmController
│   │   │   ├── Requests/        # Validación de inputs
│   │   │   └── Resources/       # UserResource, VmResource (transformación JSON)
│   │   ├── Models/              # User, Vm
│   │   └── Policies/            # VmPolicy (autorización por permiso)
│   ├── database/
│   │   ├── migrations/          # Esquema de tablas
│   │   └── seeders/             # Datos de prueba (usuarios + VMs)
│   └── routes/
│       ├── api.php              # Endpoints REST + broadcasting
│       └── channels.php         # Canal privado "vms"
│
└── frontend/                    # React 19 SPA
    └── src/
        ├── context/
        │   ├── AuthContext.jsx  # Estado global de autenticación
        │   └── VmContext.jsx    # Estado de VMs + listeners WebSocket
        ├── hooks/
        │   └── useAuth.js       # Acceso al contexto de auth
        ├── lib/
        │   ├── api.js           # Wrapper fetch (CSRF, 401, headers)
        │   └── echo.js          # Instancia Laravel Echo (Reverb)
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── DashboardPage.jsx
        ├── components/
        │   ├── AuthShell.jsx    # Layout de páginas de autenticación
        │   └── vms/
        │       ├── VmTable.jsx        # Tabla principal (muestra Actions solo a admin)
        │       ├── VmModal.jsx        # Modal crear / editar VM
        │       ├── VmForm.jsx         # Formulario de VM
        │       ├── VmDeleteDialog.jsx # Confirmación de borrado
        │       └── VmStatusBadge.jsx  # Badge running / stopped
        └── services/
            ├── auth.service.js  # Login, register, logout, me()
            └── vm.service.js    # CRUD de VMs
```

---

## Guía de instalación local

### Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| PHP         | 8.3           |
| Composer    | 2.x           |
| Node.js     | 20.x          |
| npm         | 10.x          |
| Git         | cualquiera    |

---

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd IXF
```

---

### 2. Configurar el Backend

```bash
cd backend
```

**Instalar dependencias PHP**

```bash
composer install
```

**Copiar variables de entorno**

```bash
cp .env.example .env
```

> El `.env.example` ya tiene todos los valores configurados para desarrollo local. No es necesario editar nada.

**Crear la base de datos SQLite**

```bash
touch database/database.sqlite
```

**Ejecutar migraciones y seeders**

```bash
php artisan migrate --seed
```

Este comando crea todas las tablas y carga:
- Roles: `admin`, `client`
- Permisos granulares por rol
- 3 usuarios de prueba (ver sección [Credenciales](#credenciales-de-prueba))
- 10 VMs de ejemplo distribuidas entre los clientes

**Limpiar cachés**

```bash
php artisan config:clear
php artisan route:clear
```

---

### 3. Configurar el Frontend

```bash
cd ../frontend
```

**Instalar dependencias Node**

```bash
npm install
```

**Copiar variables de entorno**

```bash
cp .env.example .env
```

---

### 4. Levantar los servicios

Abrir **3 terminales** en la carpeta `backend/` y ejecutar uno por terminal:

**Terminal 1 — API Laravel**

```bash
php artisan serve
# Disponible en http://localhost:8000
```

**Terminal 2 — Servidor WebSocket Reverb**

```bash
php artisan reverb:start
# Disponible en ws://localhost:8080
```

**Terminal 3 — Frontend Vite**

```bash
cd ../frontend
npm run dev
# Disponible en http://localhost:5173 o http://localhost:5174
```

> **Nota:** Si Vite arranca en el puerto `5173` y ves errores de CORS, edita el `.env` del backend y cambia `FRONTEND_URL=http://localhost:5173`. El `SANCTUM_STATEFUL_DOMAINS` ya incluye ambos puertos.

**Abrir el navegador en** `http://localhost:5173` (o el puerto que indique Vite).

---

## Credenciales de prueba

Generadas automáticamente por los seeders al ejecutar `php artisan migrate --seed`.

| Rol       | Email                 | Contraseña | Permisos                              |
|-----------|-----------------------|------------|---------------------------------------|
| **Admin** | admin@example.com     | password   | Ver, Crear, Editar y Eliminar VMs     |
| Cliente 1 | client1@example.com   | password   | Solo ver VMs                          |
| Cliente 2 | client2@example.com   | password   | Solo ver VMs                          |

**Diferencias en la UI por rol:**

- **Admin:** ve el botón `+ NEW VM`, columna `Actions` con botones `EDIT` y `DELETE` en cada fila.
- **Client:** vista de solo lectura, sin controles de modificación.

---

## Bitácora de IA

### Herramientas utilizadas

- **Claude Code (Anthropic)** — asistente principal integrado en la terminal. Se usó a través de la CLI `claude` durante todo el desarrollo.

---

### Distribución del trabajo

| Área | Nivel de delegación | Intervención manual |
|------|--------------------|--------------------|
| Scaffold del proyecto (Laravel + Vite) | Alto | Solo decisión de stack |
| Modelos, migraciones y relaciones | Alto | Revisión de índices y constraints |
| Sistema de roles con Spatie | Alto | Ajuste de permisos granulares |
| AuthController + Sanctum SPA | Alto | Corrección del middleware `web` duplicado en rutas API |
| VmController + Policy | Alto | Revisión de autorización por permiso vs. por rol |
| Eventos WebSocket (Reverb) | Alto | Cambio de `ShouldBroadcast` a `ShouldBroadcastNow` |
| AuthContext (React) | Medio | Diagnóstico del bug de `data` wrapper de `JsonResource` |
| VmContext + Echo | Medio | Fix del unwrap en `create`/`update` y cleanup del Echo |
| Componentes UI (VmTable, VmModal) | Alto | Revisión de guards de rol (`isAdmin`) |
| Debugging de sesión / CORS | Bajo | Todo el diagnóstico y fix fue asistido por IA |

---

### Prompts clave

**Prompt 1 — Configuración de WebSockets y roles en tiempo real**

> *"El admin crea una VM y el cliente debería verla aparecer en su tabla sin recargar. Tengo Reverb corriendo. Los eventos están configurados con `ShouldBroadcast`. El frontend usa Laravel Echo en un `VmContext`. ¿Por qué no llegan los eventos al cliente?"*

Este prompt llevó al diagnóstico de que `ShouldBroadcast` despacha a la cola de trabajos (requiere `php artisan queue:work`), mientras que `ShouldBroadcastNow` lo hace de forma síncrona. También se descubrió que el `VmContext` no hacía `destroyEcho()` en el cleanup del efecto, acumulando listeners duplicados en React Strict Mode.

**Prompt 2 — Bug de roles: admin ve lo mismo que cliente**

> *"Si ingreso con admin aparece igual que con client — no aparecen los botones de crear, editar ni borrar. El check `isAdmin` siempre es `false`. ¿Qué está pasando?"*

La IA diagnosticó que `UserResource` de Laravel envuelve la respuesta en `{ "data": { ... } }`, pero el `auth.service.js` del frontend no desenvolvia ese wrapper. Por eso `user.roles` era `undefined` y `isAdmin` resultaba siempre `false`. El fix fue añadir `.then(res => res.data ?? res)` en `me()`, `login()` y `register()`.

---

### Nota sobre el uso de IA

> El asistente de IA aceleró significativamente el scaffolding y la escritura de código repetitivo (migraciones, recursos, seeders, componentes React). Sin embargo, los bugs más sutiles —como el conflicto de middleware `web` duplicado en rutas API de Sanctum, el wrapper `data` de `JsonResource`, o la diferencia entre `ShouldBroadcast` y `ShouldBroadcastNow`— requirieron comprensión profunda de cómo Laravel gestiona sesiones, CORS y broadcasting para guiar al asistente hacia la solución correcta. La IA es eficaz para ejecutar; el criterio para saber qué ejecutar y por qué sigue siendo humano.
