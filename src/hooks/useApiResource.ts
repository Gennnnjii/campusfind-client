import { useCallback, useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'

type ResourceState<T> = {
  path: string | null
  data: T | null
  isLoading: boolean
  error: string | null
}

export function useApiResource<T>(path: string | null) {
  const [state, setState] = useState<ResourceState<T>>({
    path,
    data: null,
    isLoading: Boolean(path),
    error: null,
  })
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    if (!path) return

    const controller = new AbortController()
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setState({ path, data: null, isLoading: true, error: null })
      }
    })

    api.get<{ data: T }>(path, { signal: controller.signal })
      .then((response) => {
        setState({ path, data: response.data.data, isLoading: false, error: null })
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setState({ path, data: null, isLoading: false, error: getErrorMessage(requestError) })
        }
      })

    return () => controller.abort()
  }, [path, reloadKey])

  const visibleState = state.path === path
    ? state
    : { path, data: null, isLoading: Boolean(path), error: null }

  return { ...visibleState, reload }
}
