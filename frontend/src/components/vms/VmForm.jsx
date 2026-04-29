import { FormField } from '../ui/FormField'

const OS_OPTIONS = ['ubuntu', 'debian', 'centos', 'fedora', 'arch', 'windows']

export function VmForm({ fields, onChange, errors }) {
  function update(key) {
    return (e) => {
      const value = e.target.value
      onChange((prev) => ({ ...prev, [key]: value }))
    }
  }

  function updateNumber(key) {
    return (e) => {
      const value = Number(e.target.value)
      onChange((prev) => ({ ...prev, [key]: value }))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FormField.Root id="vm-name">
        <FormField.Label>Name</FormField.Label>
        <FormField.Control
          type="text"
          placeholder="web-server-01"
          value={fields.name}
          onChange={update('name')}
          error={errors.name}
          required
        />
        <FormField.Error>{errors.name?.[0]}</FormField.Error>
      </FormField.Root>

      <FormField.Root id="vm-os">
        <FormField.Label>Operating System</FormField.Label>
        <FormField.Select value={fields.os} onChange={update('os')} error={errors.os}>
          {OS_OPTIONS.map((os) => (
            <option key={os} value={os}>{os}</option>
          ))}
        </FormField.Select>
        <FormField.Error>{errors.os?.[0]}</FormField.Error>
      </FormField.Root>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <FormField.Root id="vm-cores">
          <FormField.Label>Cores</FormField.Label>
          <FormField.Control
            type="number"
            min="1"
            value={fields.cores}
            onChange={updateNumber('cores')}
            error={errors.cores}
            required
          />
          <FormField.Error>{errors.cores?.[0]}</FormField.Error>
        </FormField.Root>

        <FormField.Root id="vm-ram">
          <FormField.Label>RAM (GB)</FormField.Label>
          <FormField.Control
            type="number"
            min="1"
            value={fields.ram}
            onChange={updateNumber('ram')}
            error={errors.ram}
            required
          />
          <FormField.Error>{errors.ram?.[0]}</FormField.Error>
        </FormField.Root>

        <FormField.Root id="vm-disk">
          <FormField.Label>Disk (GB)</FormField.Label>
          <FormField.Control
            type="number"
            min="1"
            value={fields.disk}
            onChange={updateNumber('disk')}
            error={errors.disk}
            required
          />
          <FormField.Error>{errors.disk?.[0]}</FormField.Error>
        </FormField.Root>
      </div>

      <FormField.Root id="vm-status">
        <FormField.Label>Status</FormField.Label>
        <FormField.Select value={fields.status} onChange={update('status')} error={errors.status}>
          <option value="stopped">stopped</option>
          <option value="running">running</option>
        </FormField.Select>
        <FormField.Error>{errors.status?.[0]}</FormField.Error>
      </FormField.Root>
    </div>
  )
}
