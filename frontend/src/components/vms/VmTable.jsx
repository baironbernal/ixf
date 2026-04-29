import { VmStatusBadge } from './VmStatusBadge'

const TH = ({ children, right }) => (
  <th
    style={{
      padding: '10px 16px',
      textAlign: right ? 'right' : 'left',
      fontSize: '10px',
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--color-muted)',
      fontWeight: 400,
      borderBottom: '1px solid var(--color-border)',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </th>
)

const TD = ({ children, mono, right }) => (
  <td
    style={{
      padding: '12px 16px',
      fontSize: '13px',
      color: 'var(--color-ink)',
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      borderBottom: '1px solid rgba(28, 36, 56, 0.6)',
      textAlign: right ? 'right' : 'left',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </td>
)

function VmRow({ vm, isAdmin, onEdit, onDelete }) {
  return (
    <tr
      style={{ transition: 'background 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(28,36,56,0.4)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <TD mono>{vm.name}</TD>
      <TD mono>{vm.os}</TD>
      <TD right>{vm.cores}</TD>
      <TD right>{vm.ram} GB</TD>
      <TD right>{vm.disk} GB</TD>
      <TD><VmStatusBadge status={vm.status} /></TD>
      {isAdmin ? (
        <TD right>
          <div style={{ display: 'inline-flex', gap: '8px' }}>
            <button
              onClick={() => onEdit(vm)}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--color-muted)',
                borderRadius: '2px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'
                e.currentTarget.style.color = 'var(--color-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-muted)'
              }}
            >
              EDIT
            </button>
            <button
              onClick={() => onDelete(vm)}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: 'var(--color-muted)',
                borderRadius: '2px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,68,68,0.4)'
                e.currentTarget.style.color = 'var(--color-error)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-muted)'
              }}
            >
              DELETE
            </button>
          </div>
        </TD>
      ) : null}
    </tr>
  )
}

function EmptyRow({ isAdmin }) {
  const colSpan = isAdmin ? 7 : 6
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{ padding: '48px 24px', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid var(--color-border)',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="1" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>
            No virtual machines found
          </span>
        </div>
      </td>
    </tr>
  )
}

export function VmTable({ vms, isAdmin, onEdit, onDelete }) {
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'var(--color-surface-raised)' }}>
          <tr>
            <TH>Name</TH>
            <TH>OS</TH>
            <TH right>Cores</TH>
            <TH right>RAM</TH>
            <TH right>Disk</TH>
            <TH>Status</TH>
            {isAdmin ? <TH right>Actions</TH> : null}
          </tr>
        </thead>
        <tbody>
          {vms.length > 0 ? (
            vms.map((vm) => (
              <VmRow
                key={vm.id}
                vm={vm}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <EmptyRow isAdmin={isAdmin} />
          )}
        </tbody>
      </table>
    </div>
  )
}
