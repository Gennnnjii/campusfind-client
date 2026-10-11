import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ItemCard } from '../components/ItemCard'
import { LoadingState, StatePanel } from '../components/PageStates'
import { useCategories } from '../hooks/useCategories'
import { useItems, type ItemFilters } from '../hooks/useItems'
import { useLocations } from '../hooks/useLocations'
import type { Item } from '../types'

export type BrowseItemsPageProps = {
  lockedType?: 'lost' | 'found'
  title?: string
  description?: string
}

export function BrowseItemsPage({ lockedType, title, description }: BrowseItemsPageProps = {}) {
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ItemFilters['type']>(lockedType ?? '')
  const [status, setStatus] = useState<ItemFilters['status']>('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [itemToRecover, setItemToRecover] = useState<Item | null>(null)
  const [isRecovering, setIsRecovering] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)

  const effectiveType: ItemFilters['type'] = lockedType ?? type

  useEffect(() => {
    const timer = setTimeout(() => setSearch(rawSearch), 300)
    return () => clearTimeout(timer)
  }, [rawSearch])

  const isStatusCompatible = (targetStatus: ItemFilters['status'], currentType: ItemFilters['type']) => {
    if (!targetStatus) return true
    if (currentType === 'lost') return targetStatus === 'open' || targetStatus === 'recovered'
    if (currentType === 'found') return ['pending_turnover', 'available_for_claim', 'returned'].includes(targetStatus)
    return true
  }

  const effectiveStatus = isStatusCompatible(status, effectiveType) ? status : ''

  const handleTypeChange = (newType: ItemFilters['type']) => {
    if (lockedType) return
    setType(newType)
    if (newType === 'lost' && status !== 'open' && status !== 'recovered') setStatus('')
    if (newType === 'found' && !['pending_turnover', 'available_for_claim', 'returned'].includes(status)) setStatus('')
  }

  const filters: ItemFilters = { search, type: effectiveType, status: effectiveStatus, category, location }
  const hasActiveFilters = Boolean(search.trim() || (!lockedType && type) || effectiveStatus || category || location)

  const clearFilters = () => {
    setRawSearch('')
    setSearch('')
    if (!lockedType) {
      setType('')
    }
    setStatus('')
    setCategory('')
    setLocation('')
  }

  const { data: items, isLoading: itemsLoading, error: itemsError, reload: reloadItems } = useItems(filters)
  const { data: categories, isLoading: categoriesLoading, error: categoriesError, reload: reloadCategories } = useCategories()
  const { data: locations, isLoading: locationsLoading, error: locationsError, reload: reloadLocations } = useLocations()

  const markRecovered = async () => {
    if (!itemToRecover) return
    setIsRecovering(true)
    setStatusError(null)
    setStatusSuccess(null)
    try {
      const response = await api.patch<{ message?: string }>(`/items/${itemToRecover._id}/status`, { status: 'recovered' })
      setStatusSuccess(response.data.message ?? 'Lost item marked Recovered successfully.')
      setItemToRecover(null)
      reloadItems()
    } catch (requestError) {
      setStatusError(getErrorMessage(requestError))
      setItemToRecover(null)
    } finally {
      setIsRecovering(false)
    }
  }

  const headingTitle = title ?? (
    lockedType === 'lost'
      ? 'Lost Reports'
      : lockedType === 'found'
        ? 'Found Reports'
        : 'Browse Items'
  )

  const headingDescription = description ?? (
    lockedType === 'lost'
      ? 'Browse reported Lost Items and track their recovery status.'
      : lockedType === 'found'
        ? 'Browse reported Found Items held within the SDAO workflow.'
        : 'View campus Lost and Found reports.'
  )

  const emptyTitle = hasActiveFilters
    ? 'No matching items'
    : lockedType === 'lost'
      ? 'No Lost reports found'
      : lockedType === 'found'
        ? 'No Found reports found'
        : 'No items found'

  const emptyMessage = hasActiveFilters
    ? 'Try adjusting or clearing your search and filters.'
    : lockedType === 'lost'
      ? 'No Lost reports are currently available.'
      : lockedType === 'found'
        ? 'No Found reports are currently available.'
        : 'No Lost or Found reports are currently available.'

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-campus-navy">{headingTitle}</h1>
        <p className="mt-2 text-base text-slate-500">{headingDescription}</p>
      </header>

      {statusSuccess && <StatePanel title="Status updated" message={statusSuccess} tone="success" />}
      {statusError && <StatePanel title="Status not updated" message={statusError} tone="error" />}

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
            <label htmlFor="search" className="text-sm font-bold text-slate-700">Search</label>
            <input
              id="search"
              type="search"
              maxLength={120}
              placeholder="Search by title or description"
              value={rawSearch}
              onChange={(event) => setRawSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal"
            />
          </div>

          {!lockedType && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="type" className="text-sm font-bold text-slate-700">Type</label>
              <select
                id="type"
                value={type}
                onChange={(event) => handleTypeChange(event.target.value as ItemFilters['type'])}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal"
              >
                <option value="">All types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-bold text-slate-700">Status</label>
            <select
              id="status"
              value={effectiveStatus}
              onChange={(event) => setStatus(event.target.value as ItemFilters['status'])}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal"
            >
              <option value="">All statuses</option>
              {effectiveType !== 'found' && (
                <>
                  <option value="open">Open</option>
                  <option value="recovered">Recovered</option>
                </>
              )}
              {effectiveType !== 'lost' && (
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
              onChange={(event) => setCategory(event.target.value)}
              disabled={categoriesLoading || Boolean(categoriesError)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{categoriesLoading ? 'Loading categories...' : 'All categories'}</option>
              {categories?.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
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
              onChange={(event) => setLocation(event.target.value)}
              disabled={locationsLoading || Boolean(locationsError)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-campus-teal focus:outline-none focus:ring-1 focus:ring-campus-teal disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="">{locationsLoading ? 'Loading locations...' : 'All locations'}</option>
              {locations?.map((entry) => <option key={entry._id} value={entry._id}>{entry.name}</option>)}
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
            action={<button onClick={reloadItems} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700">Try again</button>}
          />
        )}
        {!itemsLoading && !itemsError && items?.length === 0 && (
          <StatePanel title={emptyTitle} message={emptyMessage} />
        )}
        {!itemsLoading && !itemsError && items && items.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onRecover={effectiveType === 'found' ? undefined : setItemToRecover}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(itemToRecover)}
        title="Mark this Lost item Recovered?"
        message={itemToRecover ? `Confirm that “${itemToRecover.title}” has been recovered. This changes its status from Open to Recovered.` : ''}
        confirmLabel="Mark recovered"
        isBusy={isRecovering}
        onConfirm={markRecovered}
        onCancel={() => { if (!isRecovering) setItemToRecover(null) }}
      />
    </div>
  )
}
