import { use } from 'react'
import { VmContext } from '../context/VmContext'

export function useVms() {
  return use(VmContext)
}
