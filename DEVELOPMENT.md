# IXF — Development Guide

Registro de todo lo implementado en el backend Laravel, decisiones técnicas tomadas, y referencia del flujo de broadcasting en tiempo real.

---

## Stack

- **Backend:** Laravel 12 + Sanctum (SPA cookie auth) + Spatie Laravel Permission + Laravel Reverb
- **Auth:** Cookie-based SPA — sin tokens en el body ni en localStorage
- **WebSocket:** Laravel Reverb (servidor WebSocket propio, sin Pusher externo)
- **Queue:** Database driver — jobs en tabla `jobs`
- **DB:** SQLite (desarrollo)

---

## Pasos realizados

### 1. Autenticación SPA con Sanctum (cookie-based)

Se configuró Sanctum en modo SPA, donde la sesión vive en el servidor y la credencial viaja como cookie `HttpOnly` — nunca expuesta a JavaScript.

**Archivos clave:**
- `bootstrap/app.php` — se registró `EnsureFrontendRequestsAreStateful` en el grupo API
- `config/sanctum.php` — guard `web`, dominios stateful
- `config/cors.php` — `supports_credentials: true`, origen explícito
- `.env` — `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`, `FRONTEND_URL`

**Flujo de login:**
1. Frontend hace `GET /sanctum/csrf-cookie` → recibe `XSRF-TOKEN` y `laravel_session`
2. Frontend hace `POST /api/login` con `withCredentials: true` y header `X-XSRF-TOKEN`
3. Laravel valida credenciales, regenera sesión, responde con datos del usuario
4. Todos los requests siguientes usan la sesión del cookie automáticamente

**Por qué cookies y no JWT:**
- `HttpOnly` — JavaScript nunca puede leer la credencial
- Revocación instantánea — borrar la fila en `sessions` invalida la sesión
- JWT en localStorage es vulnerable a XSS — cualquier script malicioso puede robarlo

---

### 2. AuthController

`app/Http/Controllers/API/AuthController.php`

| Método | Ruta | Descripción |
|---|---|---|
| `register` | `POST /api/register` | Crea usuario, asigna rol `client`, inicia sesión |
| `login` | `POST /api/login` | Valida credenciales, regenera sesión |
| `logout` | `POST /api/logout` | Cierra sesión, invalida sesión, rota CSRF token |
| `user` | `GET /api/user` | Retorna usuario autenticado |

**Decisiones importantes:**
- `$request->validated()` en lugar de `$request->all()` — solo los campos declarados en las reglas llegan al modelo
- `$request->session()->regenerate()` en login — previene session fixation
- `$request->session()->invalidate()` + `regenerateToken()` en logout — limpieza completa de sesión

---

### 3. Form Requests

| Clase | Propósito |
|---|---|
| `App\Http\Requests\LoginRequest` | Valida email y password |
| `App\Http\Requests\RegisterRequest` | Valida name, email único, password confirmado |
| `App\Http\Requests\Vm\StoreVmRequest` | Valida campos requeridos para crear VM |
| `App\Http\Requests\Vm\UpdateVmRequest` | Valida campos opcionales (`sometimes`) para actualizar VM |

---

### 4. UserResource

`app/Http/Resources/UserResource.php`

Expone solo `id`, `name`, `email`, `created_at`. Los campos `password`, `remember_token` y cualquier otro atributo sensible nunca salen en el response.

---

### 5. Roles y Permisos con Spatie

Paquete: `spatie/laravel-permission ^7.3`

**Roles creados:**

| Rol | Descripción |
|---|---|
| `admin` | Acceso completo a todas las operaciones |
| `client` | Solo lectura sobre VMs |

**Seeders:**

| Seeder | Qué hace |
|---|---|
| `RoleSeeder` | Crea roles `admin` y `client` |
| `PermissionSeeder` | Crea permisos VM, los asigna a roles |
| `UserSeeder` | Crea 3 usuarios de prueba con sus roles |

**Orden obligatorio en DatabaseSeeder:**
```
RoleSeeder → PermissionSeeder → UserSeeder
```
Los permisos deben existir antes de asignarlos. Los roles deben existir antes de asignar usuarios.

**Usuarios de prueba:**

| Email | Password | Rol |
|---|---|---|
| `admin@example.com` | `password` | admin |
| `client1@example.com` | `password` | client |
| `client2@example.com` | `password` | client |

---

### 6. Modelo VM

`app/Models/Vm.php`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | primary key | |
| `name` | string | |
| `cores` | integer | mínimo 1 |
| `ram` | integer GB | mínimo 1 |
| `disk` | integer GB | mínimo 1 |
| `os` | string | ubuntu, windows, etc |
| `status` | enum | `running` / `stopped`, default `stopped` |
| `user_id` | foreign key | owner, cascade on delete |
| `created_at` / `updated_at` | timestamps | |

---

### 7. VmController y VmResource

`app/Http/Controllers/API/VmController.php`

Todas las rutas están dentro del middleware `auth:sanctum`.

| Método | Ruta | Permiso requerido |
|---|---|---|
| `index` | `GET /api/vms` | `vm.viewAny` |
| `store` | `POST /api/vms` | `vm.create` |
| `show` | `GET /api/vms/{vm}` | `vm.view` |
| `update` | `PUT/PATCH /api/vms/{vm}` | `vm.update` |
| `destroy` | `DELETE /api/vms/{vm}` | `vm.delete` |

`user_id` se asigna desde `Auth::id()` en el controlador — el cliente nunca puede declararse dueño de una VM.

---

### 8. Políticas con VmPolicy

`app/Policies/VmPolicy.php`

Cada método del controlador llama `$this->authorize()` antes de ejecutar cualquier lógica. La política consulta los permisos de Spatie:

```php
public function update(User $user, Vm $vm): bool
{
    return $user->hasPermissionTo('vm.update');
}
```

**Matriz de permisos:**

| Permiso | admin | client |
|---|---|---|
| `vm.viewAny` | ✅ | ✅ |
| `vm.view` | ✅ | ✅ |
| `vm.create` | ✅ | ❌ |
| `vm.update` | ✅ | ❌ |
| `vm.delete` | ✅ | ❌ |

La política no sabe de roles, solo de permisos. Si mañana agregas un rol `moderator` con `vm.update`, la política no necesita cambios — solo el seeder.

---

### 9. Broadcasting en tiempo real con Reverb

Paquete: Laravel Reverb (WebSocket server propio)

**Eventos creados:**

| Evento | Canal | Payload |
|---|---|---|
| `VmCreated` | `private-vms` | Todos los campos del VM |
| `VmUpdated` | `private-vms` | Todos los campos del VM |
| `VmDeleted` | `private-vms` | Solo `{ id }` |

`VmDeleted` recibe `int $vmId` y no `Vm $vm` porque `SerializesModels` intenta re-fetchear el modelo cuando el worker procesa el job — pero para ese momento la fila ya fue borrada de la DB.

Todos los eventos implementan `ShouldBroadcast` para que Laravel los enrute a la cola en lugar de procesarlos de forma síncrona.

---

## Procesos necesarios para correr el proyecto

```bash
php artisan serve          # API HTTP en :8000
php artisan reverb:start   # WebSocket server en :8080
php artisan queue:work     # Worker que procesa los jobs de broadcast
```

---

## Flujo de Broadcasting — Admin actualiza una VM

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN BROWSER                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               │  PATCH /api/vms/1
                               │  { status: "running" }
                               │  Cookie: laravel_session
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       LARAVEL :8000                             │
│                                                                 │
│  1. auth:sanctum         ── verifica la sesión del cookie       │
│  2. VmPolicy::update()   ── verifica permiso vm.update          │
│  3. $vm->update(...)     ── actualiza la fila en la DB          │
│  4. VmUpdated::dispatch($vm)                                    │
│       └─ detecta ShouldBroadcast                                │
│       └─ INSERT en tabla jobs { vm_id: 1, event: VmUpdated }   │
│  5. return VmResource    ── responde 200 al admin               │
└───────────┬─────────────────────────────┬───────────────────────┘
            │                             │
            │  200 OK { ...vm data }      │  INSERT job
            ▼                             ▼
┌───────────────────────┐        ┌────────────────────────────────┐
│     ADMIN BROWSER     │        │         DATABASE               │
│                       │        │                                │
│  recibe la respuesta  │        │  tabla jobs                    │
│  HTTP normalmente     │        │  ┌──────────────────────────┐  │
│                       │        │  │ id │ payload             │  │
│  UI se actualiza con  │        │  │ 1  │ VmUpdated | vm_id:1 │  │
│  el dato del response │        │  └──────────────────────────┘  │
└───────────────────────┘        └────────────────┬───────────────┘
                                                  │
                                                  │  detecta nuevo job
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    QUEUE WORKER (proceso separado)              │
│                    php artisan queue:work                       │
│                                                                 │
│  1. toma el job de la tabla jobs                                │
│  2. reconstruye VmUpdated → Vm::find(1)                        │
│  3. llama broadcastOn()   → canal: "private-vms"               │
│  4. llama broadcastWith() → { id:1, status:"running", ... }    │
│  5. borra el job de la tabla jobs                               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │  POST /apps/{app_id}/events
                                │  {
                                │    channel: "private-vms",
                                │    event:   "VmUpdated",
                                │    data:    { id:1, status:"running" }
                                │  }
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       REVERB :8080                              │
│                                                                 │
│  tabla interna de suscriptores:                                 │
│  ┌──────────────────┬──────────────────────────────────┐       │
│  │ canal            │ sockets conectados               │       │
│  ├──────────────────┼──────────────────────────────────┤       │
│  │ private-vms      │ abc.123 (admin), xyz.456 (client)│       │
│  └──────────────────┴──────────────────────────────────┘       │
│                                                                 │
│  busca quién está en "private-vms"                             │
│  empuja el evento por los tubos TCP ya abiertos                 │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                │  WebSocket push             │  WebSocket push
                │  { event: "VmUpdated",      │  { event: "VmUpdated",
                │    data: { id:1, ... } }    │    data: { id:1, ... } }
                ▼                             ▼
┌───────────────────────┐        ┌────────────────────────────────┐
│     ADMIN BROWSER     │        │        CLIENT BROWSER          │
│                       │        │                                │
│  .listen('VmUpdated', │        │  .listen('VmUpdated',          │
│    (data) => {        │        │    (data) => {                 │
│      actualizarVM()   │        │      actualizarVM()            │
│    })                 │        │    })                          │
└───────────────────────┘        └────────────────────────────────┘
```

### Resumen del flujo en una frase

> El controlador escribe en una cola, el worker lee la cola y le avisa a Reverb, y Reverb usa la conexión TCP que ya tenía abierta para empujar el evento al frontend en tiempo real.

---

## Mapa de archivos por responsabilidad

```
Auth
├── app/Http/Controllers/API/AuthController.php
├── app/Http/Requests/LoginRequest.php
├── app/Http/Requests/RegisterRequest.php
└── app/Http/Resources/UserResource.php

Roles y Permisos
├── database/seeders/RoleSeeder.php
├── database/seeders/PermissionSeeder.php
└── database/seeders/UserSeeder.php

VM
├── app/Models/Vm.php
├── app/Http/Controllers/API/VmController.php
├── app/Http/Requests/Vm/StoreVmRequest.php
├── app/Http/Requests/Vm/UpdateVmRequest.php
├── app/Http/Resources/VmResource.php
├── app/Policies/VmPolicy.php
└── database/migrations/..._create_vms_table.php

Broadcasting
├── app/Events/VmCreated.php
├── app/Events/VmUpdated.php
├── app/Events/VmDeleted.php
└── routes/channels.php

Configuración
├── bootstrap/app.php
├── config/sanctum.php
├── config/cors.php
└── .env
```
