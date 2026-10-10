import { useState, useEffect } from 'react'
import { useItems, type ItemFilters } from '../hooks/useItems'
import { useCategories } from '../hooks/useCategories'
import { useLocations } from '../hooks/useLocations'
import { LoadingState, StatePanel } from '../components/PageStates'
import { ItemCard } from '../components/ItemCard'

export function BrowseItemsPage() {
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ItemFilters['type']>('')
  const [status, setStatus] = useState<ItemFilters['status']>('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(rawSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [rawSearch])

  const handleTypeChange = (newType: ItemFilters['type']) => {
    setType(newType)
    if (newType === 'lost') {
      if (status !== 'open' && status !== 'recovered') {
        setStatus('')
      }
    } else if (newType === 'found') {
      if (status !== 'pending_turnover' && status !== 'available_for_claim' && status !== 'returned') {
        setStatus('')
      }
    }
  }

  const filters: ItemFilters = { search, type, status, category, location }
  const hasActiveFilters = Boolean(search.trim() || type || status || category || location)

  const clearFilters = () => {
    setRawSearch('')
    setSearch('')
    setType('')
    setStatus('')
    setCategory('')
    setLocation('')
  }

  const { data: items, isLoading: itemsLoading, error: itemsError, reload: reloadItems } = useItems(filters)
  const { data: categories, isLoading: categoriesLoading, error: categoriesError, reload: reloadCategories } = useCategories()
  const { data: locations, isLoading: locationsLoading, error: locationsError, reload: reloadLocations } = useLocations()

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-campus-navy">Browse Items</h1>
        <p className="mt-2 text-base text-slate-500">
          View campus Lost and Found reports.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
            <label htmlFor="search" className="text-sm font-bold text-slate-700">Search</label>
            <input
              id="search"
              type="search"
              maxLength={120}
              placeholder="Search by title or description"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className="text-sm font-bold text-slate-700">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ItemFilters['type'])}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal"
            >
              <option value="">All types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-bold text-slate-700">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ItemFilters['status'])}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal"
            >
              <option value="">All statuses</option>
              {type !== 'found' && (
                <>
                  <option value="open">Open</option>
                  <option value="recovered">Recovered</option>
                </>
              )}
              {type !== 'lost' && (
                <>
                  <option value="pending_turnover">Pending Turnover</option>
                  <option value="available_for_claim">Available for Claim</option>
                  <option value="returned">Returned</option>
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-bold text-slate-700">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={categoriesLoading || !!categoriesError}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{categoriesLoading ? 'Loading categories...' : 'All categories'}</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {categoriesError && (
              <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                <span>Failed to load categories.</span>
                <button type="button" onClick={reloadCategories} className="underline hover:text-red-700">Retry</button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="location" className="text-sm font-bold text-slate-700">Location</label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={locationsLoading || !!locationsError}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{locationsLoading ? 'Loading locations...' : 'All locations'}</option>
              {locations?.map((l) => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))}
            </select>
            {locationsError && (
              <div className="flex items-center gap-2 text-xs font-medium text-red-600">
                <span>Failed to load locations.</span>
                <button type="button" onClick={reloadLocations} className="underline hover:text-red-700">Retry</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-slate-100"
          >
            Clear filters
          </button>
        </div>
      </section>

      <div className="min-h-[50vh]">
        {itemsLoading && <LoadingState label="Loading items" />}

        {!itemsLoading && itemsError && (
          <StatePanel
            title="Unable to load items"
            message={itemsError}
            tone="error"
            action={
              <button
                onClick={reloadItems}
                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Try again
              </button>
            }
          />
        )}

        {!itemsLoading && !itemsError && items?.length === 0 && (
          <StatePanel
            title={hasActiveFilters ? "No matching items" : "No items found"}
            message={hasActiveFilters ? "Try adjusting or clearing your search and filters." : "No Lost or Found reports are currently available."}
          />
        )}

        {!itemsLoading && !itemsError && items && items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
