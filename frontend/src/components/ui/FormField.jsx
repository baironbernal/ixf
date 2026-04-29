import { createContext, use } from 'react'

const FormFieldContext = createContext(null)

function FormFieldRoot({ id, children }) {
  return (
    <FormFieldContext value={{ id }}>
      <div className="flex flex-col gap-1.5">{children}</div>
    </FormFieldContext>
  )
}

function FormFieldLabel({ children }) {
  const { id } = use(FormFieldContext)
  return (
    <label
      htmlFor={id}
      className="text-xs font-mono tracking-widest uppercase"
      style={{ color: 'var(--color-muted)' }}
    >
      {children}
    </label>
  )
}

function FormFieldControl({ ref, error, ...props }) {
  const { id } = use(FormFieldContext)
  return (
    <input
      id={id}
      ref={ref}
      className={`input-field${error ? ' has-error' : ''}`}
      {...props}
    />
  )
}

function FormFieldError({ children }) {
  return children ? (
    <span className="text-xs font-mono" style={{ color: 'var(--color-error)' }}>
      {children}
    </span>
  ) : null
}

function FormFieldSelect({ error, children, ...props }) {
  const { id } = use(FormFieldContext)
  return (
    <select
      id={id}
      className={`input-field${error ? ' has-error' : ''}`}
      style={{ cursor: 'pointer' }}
      {...props}
    >
      {children}
    </select>
  )
}

export const FormField = {
  Root: FormFieldRoot,
  Label: FormFieldLabel,
  Control: FormFieldControl,
  Select: FormFieldSelect,
  Error: FormFieldError,
}
