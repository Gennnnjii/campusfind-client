import type { NamedResource } from '../types'
import { useApiResource } from './useApiResource'

export function useLocations() {
  return useApiResource<NamedResource[]>('/locations')
}
