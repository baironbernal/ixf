import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getXsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

let instance = null

export function getEcho() {
  if (instance) return instance

  instance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        fetch(`${BASE}/api/broadcasting/auth`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getXsrfToken(),
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then((res) => res.json())
          .then((data) => callback(false, data))
          .catch((err) => callback(true, err))
      },
    }),
  })

  return instance
}

export function destroyEcho() {
  if (instance) {
    instance.disconnect()
    instance = null
  }
}
