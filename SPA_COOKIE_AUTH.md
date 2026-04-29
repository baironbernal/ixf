# SPA Cookie Authentication — Requisitos completos

Guía basada en Laravel Sanctum + React (Vite). Cada requisito es obligatorio; si falta uno, la autenticación falla silenciosamente o con `TypeError: Failed to fetch`.

---

## 1. Backend — Variables de entorno (`.env`)

```env
APP_URL=http://localhost:8000

# Debe coincidir EXACTAMENTE con el origin del browser (incluyendo puerto)
FRONTEND_URL=http://localhost:5174

# Dominio base de la sesión (sin puerto, sin protocolo)
SESSION_DOMAIN=localhost

# Todos los puertos desde donde el SPA hará requests
SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:5174

# Driver de sesión (database requiere tabla sessions creada con migrate)
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_PATH=/

# NO declarar SESSION_DOMAIN dos veces — la segunda declaración sobreescribe la primera
```

> **Regla:** después de cualquier cambio en `.env` o `config/` correr siempre:
> ```bash
> php artisan config:clear && php artisan cache:clear
> ```
> Y reiniciar `php artisan serve`. Laravel cachea la config; sin limpiar, los cambios no tienen efecto.

---

## 2. Backend — CORS (`config/cors.php`)

```php
return [
    // Rutas que reciben headers CORS — deben incluir el endpoint de CSRF
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Debe ser el origin EXACTO del browser — NUNCA '*' cuando hay credentials
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // OBLIGATORIO para que el browser acepte y envíe cookies cross-origin
    'supports_credentials' => true,
];
```

**Por qué no puede ser `*`:**
Cuando `fetch` usa `credentials: 'include'`, el browser exige que la respuesta tenga
`Access-Control-Allow-Origin` con un valor específico (no `*`) Y
`Access-Control-Allow-Credentials: true`.
Si cualquiera de los dos falta, el browser bloquea la respuesta y lanza `TypeError: Failed to fetch`.

---

## 3. Backend — Middleware Sanctum (`bootstrap/app.php`)

```php
->withMiddleware(function (Middleware $middleware): void {
    // Prepend en el grupo API — hace que requests del SPA usen sesión en vez de tokens
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
})
```

**Qué hace este middleware:**
- Lee el header `Origin` o `Referer` del request
- Si coincide con `SANCTUM_STATEFUL_DOMAINS`, inyecta el stack de web middleware (sesión, cookies, CSRF)
- Si no coincide, trata el request como API token (stateless)

---

## 4. Backend — Rutas API (`routes/api.php`)

```php
// Login y register deben usar middleware 'web' para tener acceso a sesión
Route::middleware(['web'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Rutas protegidas usan auth:sanctum — valida la sesión del cookie
Route::middleware(['auth:sanctum', 'web'])->group(function () {
    Route::get('/user',     [AuthController::class, 'user']);
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::apiResource('vms', VmController::class);
});
```

**Por qué `web` en las rutas API:**
Las rutas en `routes/api.php` no tienen sesión por defecto.
El middleware `web` aporta `StartSession`, `EncryptCookies` y `VerifyCsrfToken`
que son necesarios para que Sanctum pueda leer y escribir la sesión.

---

## 5. Backend — AuthController

```php
public function login(LoginRequest $request)
{
    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Obligatorio — previene session fixation attacks
    $request->session()->regenerate();

    return new UserResource(Auth::user());
}

public function logout(Request $request)
{
    Auth::logout();

    // Invalida la sesión actual y rota el CSRF token
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->json(['message' => 'Logged out successfully']);
}
```

---

## 6. Frontend — Cliente HTTP (`src/lib/api.js`)

```js
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Lee el XSRF-TOKEN cookie y lo decodifica (Laravel lo envía URL-encoded)
function getXsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function request(method, path, body) {
  const xsrf = getXsrfToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',          // Sin esto Laravel devuelve redirects HTML en vez de JSON
      ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    },
    credentials: 'include',                  // OBLIGATORIO — envía laravel_session y XSRF-TOKEN
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204 || res.status === 205) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw data
  return data
}

// Inicializa la protección CSRF — debe llamarse ANTES del login/register
export async function csrf() {
  await fetch(`${BASE}/sanctum/csrf-cookie`, { credentials: 'include' })
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
}
```

**Por qué `credentials: 'include'`:**
Por defecto `fetch` usa `credentials: 'omit'`.
Las cookies NO se envían automáticamente en requests cross-origin.
`credentials: 'include'` le dice al browser que adjunte cookies aunque el request sea cross-origin.

---

## 7. Frontend — Variable de entorno (`.env`)

```env
# Debe apuntar al puerto donde corre php artisan serve
VITE_API_URL=http://localhost:8000
```

---

## 8. Flujo completo de autenticación

```
1. App carga
   └─ GET /api/user  →  401  →  user = null  →  muestra /login
                    →  200  →  user = {...}  →  redirige a /dashboard

2. Usuario hace login
   └─ GET  /sanctum/csrf-cookie  →  204
          Browser recibe: XSRF-TOKEN cookie + laravel_session cookie

   └─ POST /api/login  { email, password }
          Headers: X-XSRF-TOKEN: <decoded cookie value>
                   credentials: include  →  envía laravel_session
          Response 200: { id, name, email, ... }
          Browser recibe: laravel_session actualizada

3. Requests autenticados posteriores
   └─ GET/POST/PATCH /api/vms  ...
          Headers: X-XSRF-TOKEN: <token>
          Cookies: laravel_session=<id>  →  Laravel identifica al usuario

4. Logout
   └─ POST /api/logout
          Laravel invalida sesión y rota CSRF token
          Frontend setUser(null)  →  redirige a /login
```

---

## 9. Tabla de errores comunes

| Error | Causa | Fix |
|---|---|---|
| `TypeError: Failed to fetch` | CORS no devuelve `Access-Control-Allow-Origin` | `allowed_origins` debe coincidir con el `Origin` exacto del browser |
| `TypeError: Failed to fetch` | Backend no está corriendo | Iniciar `php artisan serve` |
| `419 CSRF token mismatch` | `X-XSRF-TOKEN` no se envía o está mal decodificado | Verificar `getXsrfToken()` y `credentials: 'include'` en `csrf()` |
| `401 Unauthenticated` | `laravel_session` no se envía | `credentials: 'include'` en todos los requests |
| `401` después de login correcto | `SANCTUM_STATEFUL_DOMAINS` no incluye el puerto del SPA | Agregar `localhost:<puerto>` al `.env` y limpiar config cache |
| Login no redirige | `SESSION_DOMAIN` declarado dos veces en `.env` | Dejar solo una declaración |
| Cambios en config no tienen efecto | Config cacheada | `php artisan config:clear && php artisan cache:clear` |
| Cookies no se almacenan | `supports_credentials: false` o `allowed_origins: ['*']` | Corregir `config/cors.php` |

---

## 10. Procesos necesarios para desarrollo local

```bash
# Terminal 1
php artisan serve          # API en :8000

# Terminal 2
php artisan reverb:start   # WebSocket en :8080

# Terminal 3
php artisan queue:work     # Worker para broadcasting

# Terminal 4 (frontend)
npm run dev                # Vite en :5173 o :5174
```

Cada vez que cambie el puerto de Vite, actualizar en el backend:
- `FRONTEND_URL`
- `SANCTUM_STATEFUL_DOMAINS`
- Correr `php artisan config:clear`
