import { useState, useEffect, useTransition } from 'react'
import { Modal } from '../ui/Modal'
import { VmForm } from './VmForm'
import { PrimaryButton, GhostButton } from '../ui/Button'
import { useVms } from '../../hooks/useVms'

const EMPTY = { name: '', os: 'ubuntu', cores: 1, ram: 1, disk: 20, status: 'stopped' }

export function CreateVmModal({ open, onClose }) {
  const { actions: { create } } = useVms()
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setFields(EMPTY)
      setErrors({})
    }
  }, [open])

  function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    startTransition(async () => {
      try {
        await create(fields)
        onClose()
      } catch (err) {
        setErrors(err.errors ?? {})
      }
    })
  }

  return (
    <Modal.Root open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Modal.Header onClose={onClose}>New Virtual Machine</Modal.Header>
        <Modal.Body>
          <VmForm fields={fields} onChange={setFields} errors={errors} />
        </Modal.Body>
        <Modal.Footer>
          <GhostButton type="button" onClick={onClose}>CANCEL</GhostButton>
          <PrimaryButton type="submit" loading={isPending}>CREATE VM</PrimaryButton>
        </Modal.Footer>
      </form>
    </Modal.Root>
  )
}

export function EditVmModal({ open, onClose, vm }) {
  const { actions: { update } } = useVms()
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open && vm) {
      setFields({
        name: vm.name,
        os: vm.os,
        cores: vm.cores,
        ram: vm.ram,
        disk: vm.disk,
        status: vm.status,
      })
      setErrors({})
    }
  }, [open, vm])

  function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    startTransition(async () => {
      try {
        await update(vm.id, fields)
        onClose()
      } catch (err) {
        setErrors(err.errors ?? {})
      }
    })
  }

  return (
    <Modal.Root open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Modal.Header onClose={onClose}>
          Edit VM — {vm?.name}
        </Modal.Header>
        <Modal.Body>
          <VmForm fields={fields} onChange={setFields} errors={errors} />
        </Modal.Body>
        <Modal.Footer>
          <GhostButton type="button" onClick={onClose}>CANCEL</GhostButton>
          <PrimaryButton type="submit" loading={isPending}>SAVE CHANGES</PrimaryButton>
        </Modal.Footer>
      </form>
    </Modal.Root>
  )
}
