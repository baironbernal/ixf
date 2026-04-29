const STYLES = {
  running: {
    color: 'var(--color-success)',
    background: 'rgba(0, 230, 118, 0.08)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
    dot: 'var(--color-success)',
  },
  stopped: {
    color: 'var(--color-muted)',
    background: 'rgba(72, 90, 122, 0.1)',
    border: '1px solid var(--color-border)',
    dot: 'var(--color-muted)',
  },
}

export function VmStatusBadge({ status }) {
  const style = STYLES[status] ?? STYLES.stopped
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 8px',
        borderRadius: '2px',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.06em',
        color: style.color,
        background: style.background,
        border: style.border,
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: style.dot,
          flexShrink: 0,
          animation: status === 'running' ? 'pulse 2s infinite' : 'none',
        }}
      />
      {status}
    </span>
  )
}
