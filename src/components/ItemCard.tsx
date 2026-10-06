import type { Item } from '../types'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '../utils/format'

export function ItemCard({ item }: { item: Item }) {
  const typeLabel = item.type === 'lost' ? 'Lost' : item.type === 'found' ? 'Found' : item.type
  const categoryName = item.category?.name || 'Uncategorized'
  const locationName = item.location?.name || 'Location unavailable'

  let formattedDate = 'Date unavailable'
  if (item.dateOccurred) {
    try {
      formattedDate = formatDate(item.dateOccurred, { dateStyle: 'medium' })
    } catch {
      // Fallback if the date string is malformed
      formattedDate = 'Invalid date'
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-campus-teal">
          {typeLabel}
        </span>
        <StatusBadge status={item.status} />
      </div>

      <div>
        <h3 className="break-words text-lg font-extrabold text-campus-navy">{item.title}</h3>
        {item.description && (
          <p className="mt-2 break-words text-sm text-slate-600 line-clamp-3">
            {item.description}
          </p>
        )}
      </div>

      <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 text-sm text-slate-600">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Category</dt>
          <dd className="mt-1 font-medium text-slate-700 break-words">{categoryName}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Location</dt>
          <dd className="mt-1 font-medium text-slate-700 break-words">{locationName}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Date Occurred</dt>
          <dd className="mt-1 font-medium text-slate-700 break-words">{formattedDate}</dd>
        </div>
        {item.claimLocation && (
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Claim Location</dt>
            <dd className="mt-1 font-medium text-slate-700 break-words">{item.claimLocation}</dd>
          </div>
        )}
      </dl>
    </article>
  )
}
