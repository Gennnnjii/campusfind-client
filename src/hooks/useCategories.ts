import type { NamedResource } from '../types'
import { useApiResource } from './useApiResource'

export function useCategories() {
  return useApiResource<NamedResource[]>('/categories')
}
