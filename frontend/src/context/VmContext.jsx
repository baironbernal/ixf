import { createContext, useState, useEffect, useCallback } from 'react'
import { vmService } from '../services/vm.service'
import { getEcho, destroyEcho } from '../lib/echo'

export const VmContext = createContext(null)

export function VmProvider({ children }) {
  const [vms, setVms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vmService
      .list()
      .then((data) => setVms(data.data ?? data))
      .catch(() => setVms([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const echo = getEcho()
    const channel = echo
      .private('vms')
      .listen('VmCreated', (vm) => {
        setVms((prev) => (prev.some((v) => v.id === vm.id) ? prev : [vm, ...prev]))
      })
      .listen('VmUpdated', (vm) => {
        setVms((prev) => prev.map((v) => (v.id === vm.id ? vm : v)))
      })
      .listen('VmDeleted', ({ id }) => {
        setVms((prev) => prev.filter((v) => v.id !== id))
      })

    return () => {
      channel.stopListening('VmCreated')
      channel.stopListening('VmUpdated')
      channel.stopListening('VmDeleted')
      echo.leave('vms')
    }
  }, [])

  const create = useCallback(async (data) => {
    const vm = await vmService.create(data)
    setVms((prev) => [vm, ...prev])
    return vm
  }, [])

  const update = useCallback(async (id, data) => {
    const vm = await vmService.update(id, data)
    setVms((prev) => prev.map((v) => (v.id === vm.id ? vm : v)))
    return vm
  }, [])

  const remove = useCallback(async (id) => {
    await vmService.remove(id)
    setVms((prev) => prev.filter((v) => v.id !== id))
  }, [])

  return (
    <VmContext
      value={{
        state: { vms, loading },
        actions: { create, update, remove },
      }}
    >
      {children}
    </VmContext>
  )
}
