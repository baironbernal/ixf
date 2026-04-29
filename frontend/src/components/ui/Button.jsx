function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-20"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        className="opacity-80"
      />
    </svg>
  )
}

const base =
  'relative py-3 px-6 text-sm font-mono tracking-widest flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

export function PrimaryButton({ children, loading, className = '', ...props }) {
  return (
    <button
      className={`${base} bg-accent text-surface hover:brightness-110 focus-visible:ring-accent rounded-sm ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...props }) {
  return (
    <button
      className={`${base} border border-border text-muted hover:border-accent/40 hover:text-ink rounded-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function DangerButton({ children, loading, className = '', ...props }) {
  return (
    <button
      className={`${base} border border-error/30 text-error hover:border-error hover:bg-error/10 focus-visible:ring-error rounded-sm ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}
