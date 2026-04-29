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

    echo
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
      echo.leave('vms')
      destroyEcho()
    }
  }, [])

  const create = useCallback(async (data) => {
    const res = await vmService.create(data)
    const vm = res.data ?? res
    setVms((prev) => (prev.some((v) => v.id === vm.id) ? prev : [vm, ...prev]))
    return vm
  }, [])

  const update = useCallback(async (id, data) => {
    const res = await vmService.update(id, data)
    const vm = res.data ?? res
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
