import { useApiResource } from './useApiResource'
import type {
  CategoryStatistic,
  LocationStatistic,
  ResolutionStatistics,
  StatisticsOverview,
} from '../types'

export function useStatistics() {
  const overview = useApiResource<StatisticsOverview>(
    '/statistics/overview'
  )

  const categories = useApiResource<CategoryStatistic[]>(
    '/statistics/categories'
  )

  const locations = useApiResource<LocationStatistic[]>(
    '/statistics/locations'
  )

  const resolution = useApiResource<ResolutionStatistics>(
    '/statistics/resolution'
  )

  const reloadAll = () => {
    overview.reload()
    categories.reload()
    locations.reload()
    resolution.reload()
  }

  const isRefreshing =
    overview.isLoading ||
    categories.isLoading ||
    locations.isLoading ||
    resolution.isLoading

  return {
    overview,
    categories,
    locations,
    resolution,
    isRefreshing,
    reloadAll,
  }
}
