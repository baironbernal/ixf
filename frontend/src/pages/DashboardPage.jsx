import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useVms } from '../hooks/useVms'
import { VmProvider } from '../context/VmContext'
import { VmTable } from '../components/vms/VmTable'
import { CreateVmModal } from '../components/vms/VmModal'
import { EditVmModal } from '../components/vms/VmModal'
import { VmDeleteDialog } from '../components/vms/VmDeleteDialog'

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
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent)', fontSize: '14px' }}>
          [ IXF ]
        </span>
        <span style={{ color: 'var(--color-border)' }}>│</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Infrastructure Dashboard
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-ink)' }}>{user.name}</span>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
            {user.roles?.[0] ?? 'client'}
          </span>
        </div>
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
            transition: 'color 0.15s',
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
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, lineHeight: 1, color: highlight ? 'var(--color-accent)' : 'var(--color-ink)' }}>
        {value}
      </span>
    </div>
  )
}

function DashboardContent({ onLogout }) {
  const { user, isAdmin } = useAuth()
  const { state: { vms, loading }, actions: { remove } } = useVms()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const running = vms.filter((v) => v.status === 'running').length
  const stopped = vms.filter((v) => v.status === 'stopped').length

  return (
    <div style={{ minHeight: '100svh', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
      <TopBar user={user} onLogout={onLogout} />

      <main
        className="animate-fade-in"
        style={{ flex: 1, padding: '32px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}
      >
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 4px' }}>
            Welcome back, <span style={{ color: 'var(--color-accent)' }}>{user.name}</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-muted)', margin: 0, letterSpacing: '0.1em' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <StatCard label="Total VMs" value={loading ? '—' : vms.length} />
          <StatCard label="Running" value={loading ? '—' : running} highlight />
          <StatCard label="Stopped" value={loading ? '—' : stopped} />
        </div>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-muted)', margin: 0, fontWeight: 400 }}>
              Virtual Machines
              {loading ? null : (
                <span style={{ marginLeft: '8px', color: 'var(--color-border)' }}>({vms.length})</span>
              )}
            </h2>
            {isAdmin ? (
              <button
                onClick={() => setCreateOpen(true)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(0,212,255,0.2)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                  borderRadius: '2px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')}
              >
                + NEW VM
              </button>
            ) : null}
          </div>

          <VmTable
            vms={vms}
            isAdmin={isAdmin}
            onEdit={(vm) => setEditTarget(vm)}
            onDelete={(vm) => setDeleteTarget(vm)}
          />
        </section>
      </main>

      <CreateVmModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditVmModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        vm={editTarget}
      />

      <VmDeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        vm={deleteTarget}
        onConfirm={() => remove(deleteTarget.id)}
      />
    </div>
  )
}

export function DashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <VmProvider>
      <DashboardContent onLogout={handleLogout} />
    </VmProvider>
  )
}
