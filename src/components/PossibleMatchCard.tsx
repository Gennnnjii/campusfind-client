import type { PossibleMatch } from '../types'
import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '../utils/format'

export type PossibleMatchCardProps = {
  candidate: PossibleMatch
}

export function PossibleMatchCard({ candidate }: PossibleMatchCardProps) {
  const typeLabel = candidate.type === 'lost' ? 'Lost' : 'Found'
  const dateLabel = candidate.type === 'lost' ? 'Date Lost' : 'Date Found'
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-campus-teal">
            {typeLabel}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Match score: {candidate.score}
          </span>
        </div>
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
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{dateLabel}</dt>
          <dd className="mt-1 font-medium text-slate-700 break-words">{formattedDate}</dd>
        </div>
        {candidate.claimLocation ? (
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Claim Location</dt>
            <dd className="mt-1 font-medium text-slate-700 break-words">{candidate.claimLocation}</dd>
          </div>
        ) : null}
      </dl>

      {candidate.reasons.length > 0 && (
        <div className="space-y-1.5 border-t border-slate-100 pt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Match factors</p>
          <div className="flex flex-wrap gap-1.5" aria-label="Match factors">
            {candidate.reasons.map((reason) => (
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

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/items/${candidate._id}`}
          aria-label={`View details for ${candidate.title}`}
          className="inline-flex min-h-10 items-center rounded-lg bg-campus-navy px-3 text-sm font-bold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-campus-teal focus:ring-offset-2"
        >
          View details
        </Link>
        {candidate.type === 'found' && candidate.status === 'available_for_claim' && (
          <Link
            to={`/items/${candidate._id}/claim`}
            aria-label={`Claim ${candidate.title}`}
            className="inline-flex min-h-10 items-center rounded-lg border border-campus-teal bg-teal-50 px-3 text-sm font-bold text-teal-800 transition hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-campus-teal focus:ring-offset-2"
          >
            Claim item
          </Link>
        )}
      </div>
    </article>
  )
}
