import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function TopBar({ user, onLogout }) {
  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface-raised)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--color-accent)',
            fontSize: '14px',
            letterSpacing: '0.05em',
          }}
        >
          [ IXF ]
        </span>
        <span style={{ color: 'var(--color-border)', userSelect: 'none' }}>│</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Infrastructure Dashboard
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>{user.email}</span>
        <button
          onClick={onLogout}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            transition: 'color 0.18s',
            borderRadius: '2px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
        >
          DISCONNECT
        </button>
      </div>
    </header>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: '3px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '30px',
          fontWeight: 700,
          color: highlight ? 'var(--color-accent)' : 'var(--color-ink)',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        border: '1px dashed var(--color-border)',
        borderRadius: '3px',
        padding: '56px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '1px solid var(--color-border)',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.4,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="1" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-muted)',
          margin: 0,
          textAlign: 'center',
        }}
      >
        No virtual machines yet. Create one to get started.
      </p>
    </div>
  )
}

export function DashboardPage() {
  const {
    state: { user },
    actions: { logout },
  } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopBar user={user} onLogout={handleLogout} />

      <main
        className="animate-fade-in"
        style={{
          flex: 1,
          padding: '32px 24px',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: '0 0 6px',
            }}
          >
            Welcome back,{' '}
            <span style={{ color: 'var(--color-accent)' }}>{user?.name}</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-muted)',
              margin: 0,
              letterSpacing: '0.1em',
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '36px',
          }}
        >
          <StatCard label="Total VMs" value="—" />
          <StatCard label="Running" value="—" highlight />
          <StatCard label="Stopped" value="—" />
        </div>

        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                margin: 0,
                fontWeight: 400,
              }}
            >
              Virtual Machines
            </h2>
            <button
              style={{
                background: 'none',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                padding: '6px 14px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: 'var(--color-accent)',
                borderRadius: '2px',
                transition: 'border-color 0.18s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)')
              }
            >
              + NEW VM
            </button>
          </div>
          <EmptyState />
        </section>
      </main>
    </div>
  )
}
