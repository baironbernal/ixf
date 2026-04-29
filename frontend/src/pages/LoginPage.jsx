import { useState, useTransition } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthShell } from '../components/AuthShell'
import { FormField } from '../components/ui/FormField'
import { PrimaryButton } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

function FormAlert({ message }) {
  return message ? (
    <div
      role="alert"
      style={{
        padding: '10px 14px',
        border: '1px solid rgba(255, 68, 68, 0.25)',
        borderRadius: '3px',
        backgroundColor: 'rgba(255, 68, 68, 0.06)',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-error)',
      }}
    >
      {message}
    </div>
  ) : null
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    startTransition(async () => {
      try {
        await login(email, password)
        navigate('/dashboard')
      } catch (err) {
        console.error('[login] caught error:', err)
        setErrors(err.errors ?? { _form: [err.message ?? 'Authentication failed.'] })
      }
    })
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-ink)',
            margin: '0 0 4px',
          }}
        >
          Access Terminal
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>
          Enter your credentials to authenticate
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormAlert message={errors._form?.[0]} />

        <FormField.Root id="email">
          <FormField.Label>Email Address</FormField.Label>
          <FormField.Control
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <FormField.Error>{errors.email?.[0]}</FormField.Error>
        </FormField.Root>

        <FormField.Root id="password">
          <FormField.Label>Password</FormField.Label>
          <FormField.Control
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <FormField.Error>{errors.password?.[0]}</FormField.Error>
        </FormField.Root>

        <div style={{ marginTop: '4px' }}>
          <PrimaryButton type="submit" loading={isPending}>
            AUTHENTICATE
          </PrimaryButton>
        </div>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
          No account?{' '}
        </span>
        <Link
          to="/register"
          style={{
            fontSize: '13px',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-mono)',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
        >
          Request access
        </Link>
      </div>
    </AuthShell>
  )
}
