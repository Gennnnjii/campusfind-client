import type { Item, ItemStatus } from '../types'
import { useApiResource } from './useApiResource'

export type ItemFilters = {
  search: string
  type: '' | 'lost' | 'found'
  status: '' | ItemStatus
  category: string
  location: string
}

export function useItems(filters?: Partial<ItemFilters>) {
  let path = '/items'

  if (filters) {
    const params = new URLSearchParams()

    const search = filters.search?.trim()
    if (search) params.append('search', search)

    if (filters.type) params.append('type', filters.type)
    if (filters.status) params.append('status', filters.status)
    if (filters.category) params.append('category', filters.category)
    if (filters.location) params.append('location', filters.location)

    const queryString = params.toString()
    if (queryString) {
      path += `?${queryString}`
    }
  }

  return useApiResource<Item[]>(path)
}
