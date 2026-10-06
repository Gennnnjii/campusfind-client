import { useItems } from '../hooks/useItems'
import { LoadingState, StatePanel } from '../components/PageStates'
import { ItemCard } from '../components/ItemCard'

export function BrowseItemsPage() {
  const { data, isLoading, error, reload } = useItems()

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight text-campus-navy">Browse Items</h1>
        <p className="mt-2 text-base text-slate-500">
          View campus Lost and Found reports.
        </p>
      </header>

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
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
