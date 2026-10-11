import { useApiResource } from './useApiResource'
import type { PossibleMatch } from '../types'

export function usePossibleMatches(itemId?: string, enabled = true) {
  return useApiResource<PossibleMatch[]>(
    enabled && itemId ? `/items/${itemId}/matches` : null
  )
}
