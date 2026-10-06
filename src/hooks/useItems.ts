import type { Item } from '../types'
import { useApiResource } from './useApiResource'

export function useItems() {
  return useApiResource<Item[]>('/items')
}
