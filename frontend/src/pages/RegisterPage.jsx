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

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [fields, setFields] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})

  function update(key) {
    return (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    startTransition(async () => {
      try {
        await register(fields)
        navigate('/dashboard')
      } catch (err) {
        setErrors(err.errors ?? { _form: [err.message ?? 'Registration failed.'] })
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
          Create Account
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>
          Register to access the infrastructure panel
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormAlert message={errors._form?.[0]} />

        <FormField.Root id="name">
          <FormField.Label>Full Name</FormField.Label>
          <FormField.Control
            type="text"
            placeholder="John Smith"
            value={fields.name}
            onChange={update('name')}
            error={errors.name}
            autoComplete="name"
            required
          />
          <FormField.Error>{errors.name?.[0]}</FormField.Error>
        </FormField.Root>

        <FormField.Root id="reg-email">
          <FormField.Label>Email Address</FormField.Label>
          <FormField.Control
            type="email"
            placeholder="you@example.com"
            value={fields.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
            required
          />
          <FormField.Error>{errors.email?.[0]}</FormField.Error>
        </FormField.Root>

        <FormField.Root id="reg-password">
          <FormField.Label>Password</FormField.Label>
          <FormField.Control
            type="password"
            placeholder="min. 8 characters"
            value={fields.password}
            onChange={update('password')}
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <FormField.Error>{errors.password?.[0]}</FormField.Error>
        </FormField.Root>

        <FormField.Root id="password-confirm">
          <FormField.Label>Confirm Password</FormField.Label>
          <FormField.Control
            type="password"
            placeholder="••••••••"
            value={fields.password_confirmation}
            onChange={update('password_confirmation')}
            error={errors.password_confirmation}
            autoComplete="new-password"
            required
          />
          <FormField.Error>{errors.password_confirmation?.[0]}</FormField.Error>
        </FormField.Root>

        <div style={{ marginTop: '4px' }}>
          <PrimaryButton type="submit" loading={isPending}>
            CREATE ACCOUNT
          </PrimaryButton>
        </div>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
          Already have access?{' '}
        </span>
        <Link
          to="/login"
          style={{
            fontSize: '13px',
            color: 'var(--color-accent)',
            fontFamily: 'var(--font-mono)',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
        >
          Sign in
        </Link>
      </div>
    </AuthShell>
  )
}
