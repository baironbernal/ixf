const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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
      'Accept': 'application/json',
      ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw { message: 'Session expired. Please log in again.' }
  }

  if (res.status === 204 || res.status === 205) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw data
  return data
}

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
