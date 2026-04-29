import { useTransition } from 'react'
import { Modal } from '../ui/Modal'
import { GhostButton, DangerButton } from '../ui/Button'

export function VmDeleteDialog({ open, onClose, vm, onConfirm }) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm()
      onClose()
    })
  }

  return (
    <Modal.Root open={open} onClose={onClose}>
      <Modal.Header onClose={onClose}>Delete Virtual Machine</Modal.Header>
      <Modal.Body>
        <p style={{ color: 'var(--color-ink)', fontSize: '14px', margin: '0 0 8px', lineHeight: 1.6 }}>
          This action cannot be undone. The virtual machine{' '}
          <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
            {vm?.name}
          </span>{' '}
          and all its data will be permanently deleted.
        </p>
        <p style={{ color: 'var(--color-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)', margin: 0 }}>
          {vm?.cores} cores · {vm?.ram} GB RAM · {vm?.disk} GB disk · {vm?.os}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <GhostButton type="button" onClick={onClose}>CANCEL</GhostButton>
        <DangerButton loading={isPending} onClick={handleConfirm}>DELETE VM</DangerButton>
      </Modal.Footer>
    </Modal.Root>
  )
}
