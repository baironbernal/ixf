import { useEffect } from 'react'

function ModalRoot({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(7, 9, 14, 0.88)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ children, onClose }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--color-ink)',
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {children}
      </h3>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          background: 'none',
          border: 'none',
          padding: '2px 6px',
          cursor: 'pointer',
          color: 'var(--color-muted)',
          fontSize: '20px',
          lineHeight: 1,
          borderRadius: '2px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}
      >
        ×
      </button>
    </div>
  )
}

function ModalBody({ children }) {
  return (
    <div style={{ padding: '24px', maxHeight: '65vh', overflowY: 'auto' }}>
      {children}
    </div>
  )
}

function ModalFooter({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 24px',
        borderTop: '1px solid var(--color-border)',
        justifyContent: 'flex-end',
      }}
    >
      {children}
    </div>
  )
}

export const Modal = {
  Root: ModalRoot,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
}
