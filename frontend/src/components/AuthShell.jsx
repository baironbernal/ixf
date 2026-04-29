function GridBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(ellipse 60% 50% at 15% 55%, rgba(0, 212, 255, 0.07) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 85% 15%, rgba(80, 40, 220, 0.05) 0%, transparent 70%),
          linear-gradient(rgba(0, 212, 255, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.025) 1px, transparent 1px)
        `,
        backgroundSize: 'auto, auto, 48px 48px, 48px 48px',
      }}
    />
  )
}

function Brand() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success)',
            display: 'inline-block',
            boxShadow: '0 0 8px var(--color-success)',
            animation: 'pulse 2s infinite',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-muted)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          system online
        </span>
      </div>

      <div style={{ lineHeight: 1 }}>
        <h1
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '32px',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          <span style={{ color: 'var(--color-border)', fontSize: '24px' }}>[ </span>
          <span style={{ color: 'var(--color-accent)' }}>IXF</span>
          <span style={{ color: 'var(--color-border)', fontSize: '24px' }}> ]</span>
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--color-muted)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: '6px 0 0',
          }}
        >
          Infrastructure Exchange Framework
        </p>
      </div>
    </div>
  )
}

export function AuthShell({ children }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100svh',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <GridBackground />

      <div
        className="animate-slide-up"
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}
      >
        <Brand />

        <div
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            padding: '36px 32px',
            boxShadow:
              '0 0 0 1px rgba(0,212,255,0.03), 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {children}
        </div>

        <p
          style={{
            textAlign: 'center',
            marginTop: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'rgba(72, 90, 122, 0.4)',
            letterSpacing: '0.12em',
          }}
        >
          IXF v1.0 · Secure Connection · Cookie Auth
        </p>
      </div>
    </div>
  )
}
