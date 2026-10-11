import type { Item } from '../types'
import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '../utils/format'

export type PossibleMatchCardProps = {
  candidate: Item
  matchReasons: string[]
}

export function PossibleMatchCard({ candidate, matchReasons }: PossibleMatchCardProps) {
  const categoryName = candidate.category?.name || 'Category unavailable'
  const locationName = candidate.location?.name || 'Location unavailable'

  let formattedDate = 'Date unavailable'
  if (candidate.dateOccurred) {
    try {
      formattedDate = formatDate(candidate.dateOccurred, { dateStyle: 'medium' })
    } catch {
      formattedDate = 'Date unavailable'
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-campus-teal">
          Found
        </span>
        <StatusBadge status={candidate.status} />
      </div>

      <div>
        <h3 className="break-words text-lg font-extrabold text-campus-navy">
          {candidate.title}
        </h3>
      </div>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 text-sm text-slate-600">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Category</dt>
          <dd className="mt-1 font-medium text-slate-700 break-words">{categoryName}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Location</dt>
          <dd className="mt-1 font-medium text-slate-700 break-words">{locationName}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Date Found</dt>
          <dd className="mt-1 font-medium text-slate-700 break-words">{formattedDate}</dd>
        </div>
      </dl>

      {matchReasons.length > 0 && (
        <div className="space-y-1.5 border-t border-slate-100 pt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Match factors</p>
          <div className="flex flex-wrap gap-1.5" aria-label="Match factors">
            {matchReasons.map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-800"
              >
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-slate-100 pt-4">
        <Link
          to={`/items/${candidate._id}`}
          aria-label={`View details for ${candidate.title}`}
          className="inline-flex min-h-10 items-center rounded-lg bg-campus-navy px-3 text-sm font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-campus-teal focus:ring-offset-2"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
