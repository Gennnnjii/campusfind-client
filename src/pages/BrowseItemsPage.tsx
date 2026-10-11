import { useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { useItems } from '../hooks/useItems'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingState, StatePanel } from '../components/PageStates'
import { ItemCard } from '../components/ItemCard'
import type { Item } from '../types'

export function BrowseItemsPage() {
  const { data, isLoading, error, reload } = useItems()
  const [itemToRecover, setItemToRecover] = useState<Item | null>(null)
  const [isRecovering, setIsRecovering] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null)

  const markRecovered = async () => {
    if (!itemToRecover) return
    setIsRecovering(true)
    setStatusError(null)
    setStatusSuccess(null)
    try {
      const response = await api.patch<{ message?: string }>(`/items/${itemToRecover._id}/status`, { status: 'recovered' })
      setStatusSuccess(response.data.message ?? 'Lost item marked Recovered successfully.')
      setItemToRecover(null)
      reload()
    } catch (requestError) {
      setStatusError(getErrorMessage(requestError))
      setItemToRecover(null)
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-campus-navy">Browse Items</h1>
        <p className="mt-2 text-base text-slate-500">
          View campus Lost and Found reports.
        </p>
      </header>

      {statusSuccess && <StatePanel title="Status updated" message={statusSuccess} tone="success" />}
      {statusError && <StatePanel title="Status not updated" message={statusError} tone="error" />}

      <div className="min-h-[50vh]">
        {isLoading && <LoadingState label="Loading items" />}

        {!isLoading && error && (
          <StatePanel
            title="Unable to load items"
            message={error}
            tone="error"
            action={
              <button
                onClick={reload}
                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Try again
              </button>
            }
          />
        )}

        {!isLoading && !error && data?.length === 0 && (
          <StatePanel
            title="No items found"
            message="No Lost or Found reports are currently available."
          />
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((item) => (
              <ItemCard key={item._id} item={item} onRecover={setItemToRecover} />
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
