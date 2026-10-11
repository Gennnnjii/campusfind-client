import { Link, useParams } from 'react-router-dom'
import { LoadingState, StatePanel } from '../components/PageStates'
import { StatusBadge } from '../components/StatusBadge'
import { PossibleMatchCard } from '../components/PossibleMatchCard'
import { useApiResource } from '../hooks/useApiResource'
import { useItems } from '../hooks/useItems'
import type { Item } from '../types'
import { formatDate } from '../utils/format'

function parseTimestamp(dateStr?: string): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const timestamp = new Date(dateStr).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

function compareCandidates(a: Item, b: Item, source: Item): number {
  const statusRank = (status: string) => {
    if (status === 'available_for_claim') return 1
    if (status === 'pending_turnover') return 2
    return 3
  }
  const statusDiff = statusRank(a.status) - statusRank(b.status)
  if (statusDiff !== 0) return statusDiff

  const sourceLocId = source.location?._id
  const aSameLoc = Boolean(sourceLocId && a.location?._id && sourceLocId === a.location._id)
  const bSameLoc = Boolean(sourceLocId && b.location?._id && sourceLocId === b.location._id)
  if (aSameLoc !== bSameLoc) {
    return aSameLoc ? -1 : 1
  }

  const sourceOccurred = parseTimestamp(source.dateOccurred)
  const aOccurred = parseTimestamp(a.dateOccurred)
  const bOccurred = parseTimestamp(b.dateOccurred)

  const aValidDateComp = sourceOccurred !== null && aOccurred !== null
  const bValidDateComp = sourceOccurred !== null && bOccurred !== null
  if (aValidDateComp !== bValidDateComp) {
    return aValidDateComp ? -1 : 1
  }

  if (aValidDateComp && bValidDateComp && sourceOccurred !== null && aOccurred !== null && bOccurred !== null) {
    const aDelta = Math.abs(aOccurred - sourceOccurred)
    const bDelta = Math.abs(bOccurred - sourceOccurred)
    if (aDelta !== bDelta) {
      return aDelta - bDelta
    }
  }

  const aCreated = parseTimestamp(a.createdAt)
  const bCreated = parseTimestamp(b.createdAt)
  const aValidCreated = aCreated !== null
  const bValidCreated = bCreated !== null
  if (aValidCreated !== bValidCreated) {
    return aValidCreated ? -1 : 1
  }
  if (aCreated !== null && bCreated !== null && aCreated !== bCreated) {
    return bCreated - aCreated
  }

  return a._id.localeCompare(b._id)
}

function computeMatchReasons(source: Item, candidate: Item): string[] {
  const reasons: string[] = []

  if (source.category?._id && candidate.category?._id && source.category._id === candidate.category._id) {
    reasons.push('Same category')
  }

  if (source.location?._id && candidate.location?._id && source.location._id === candidate.location._id) {
    reasons.push('Same location')
  }

  const sourceOccurred = parseTimestamp(source.dateOccurred)
  const candidateOccurred = parseTimestamp(candidate.dateOccurred)
  if (sourceOccurred !== null && candidateOccurred !== null) {
    const diffMs = Math.abs(candidateOccurred - sourceOccurred)
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) {
      reasons.push('Found on the same day')
    } else if (diffDays === 1) {
      reasons.push('Found within 1 day')
    } else {
      reasons.push(`Found within ${diffDays} days`)
    }
  }

  return reasons
}

function PossibleMatchesSection({ source }: { source: Item }) {
  const categoryId = source.category?._id
  const { data, isLoading, error, reload } = useItems(
    categoryId ? { type: 'found', category: categoryId } : undefined
  )

  const eligibleCandidates = (data ?? [])
    .filter((candidate): candidate is Item => {
      if (candidate.type !== 'found') return false
      if (candidate.status !== 'available_for_claim' && candidate.status !== 'pending_turnover') return false
      if (candidate._id === source._id) return false
      return true
    })
    .reduce<Item[]>((acc, candidate) => {
      if (!acc.some((item) => item._id === candidate._id)) {
        acc.push(candidate)
      }
      return acc
    }, [])
    .sort((a, b) => compareCandidates(a, b, source))
    .slice(0, 3)

  return (
    <section aria-labelledby="matches-heading" className="space-y-4 border-t border-slate-100 pt-6">
      <div>
        <h2 id="matches-heading" className="text-xl font-bold tracking-tight text-campus-navy">
          Possible Found Item matches
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          These Found Item reports share public details with this Lost Item report. A possible match is not proof of ownership. Open a report to review its current status and follow the existing claim-verification process.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600 shadow-sm" role="status">
          <span className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-campus-teal" aria-hidden="true" />
          Loading possible matches…
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm" role="alert">
          <h3 className="text-sm font-bold text-red-900">Unable to load possible matches</h3>
          <p className="mt-1 text-sm text-red-800">Could not retrieve candidate reports at this time.</p>
          <div className="mt-3">
            <button
              type="button"
              onClick={reload}
              className="inline-flex min-h-10 items-center rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && eligibleCandidates.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm" role="status">
          No possible matches are available among current active Found Item reports.
        </div>
      )}

      {!isLoading && !error && eligibleCandidates.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eligibleCandidates.map((candidate) => (
            <PossibleMatchCard
              key={candidate._id}
              candidate={candidate}
              matchReasons={computeMatchReasons(source, candidate)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function ItemDetailsPage() {
  const { id } = useParams()
  const { data: item, isLoading, error, reload } = useApiResource<Item>(id ? `/items/${id}` : null)

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <StatePanel
          title="Item unavailable"
          message="No item ID was provided."
          tone="error"
          action={
            <Link
              to="/items"
              className="inline-flex min-h-11 items-center rounded-xl bg-campus-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              Back to Browse Items
            </Link>
          }
        />
      </div>
    )
  }

  if (isLoading) {
    return <LoadingState label="Loading item details" />
  }

  if (error) {
    if (error === 'Invalid item ID') {
      return (
        <div className="mx-auto max-w-3xl space-y-5">
          <StatePanel
            title="Invalid item link"
            message="The provided item identifier is invalid."
            tone="error"
            action={
              <Link
                to="/items"
                className="inline-flex min-h-11 items-center rounded-xl bg-campus-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Back to Browse Items
              </Link>
            }
          />
        </div>
      )
    }

    if (error === 'Item not found') {
      return (
        <div className="mx-auto max-w-3xl space-y-5">
          <StatePanel
            title="Item not found"
            message="This item report does not exist or may have been removed."
            tone="error"
            action={
              <Link
                to="/items"
                className="inline-flex min-h-11 items-center rounded-xl bg-campus-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Back to Browse Items
              </Link>
            }
          />
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <StatePanel
          title="Unable to load item details"
          message={error}
          tone="error"
          action={
            <button
              type="button"
              onClick={reload}
              className="inline-flex min-h-11 items-center rounded-xl bg-red-800 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-900"
            >
              Try again
            </button>
          }
        />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <StatePanel
          title="Item not found"
          message="This item report does not exist or may have been removed."
          tone="error"
          action={
            <Link
              to="/items"
              className="inline-flex min-h-11 items-center rounded-xl bg-campus-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              Back to Browse Items
            </Link>
          }
        />
      </div>
    )
  }

  const isLost = item.type === 'lost'
  const isFound = item.type === 'found'
  const typeLabel = isLost ? 'Lost' : isFound ? 'Found' : item.type
  const categoryName = item.category?.name || 'Uncategorized'
  const locationName = item.location?.name || 'Location unavailable'
  const dateOccurredLabel = isLost ? 'Date lost' : isFound ? 'Date found' : 'Date occurred'

  let formattedDateOccurred = 'Date unavailable'
  if (item.dateOccurred) {
    try {
      formattedDateOccurred = formatDate(item.dateOccurred, { dateStyle: 'medium' })
    } catch {
      formattedDateOccurred = 'Invalid date'
    }
  }

  let formattedCreatedAt: string | null = null
  if (item.createdAt) {
    try {
      formattedCreatedAt = formatDate(item.createdAt, { dateStyle: 'medium' })
    } catch {
      formattedCreatedAt = null
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          to={isLost ? '/items/lost' : isFound ? '/items/found' : '/items'}
          className="font-medium text-campus-teal transition hover:underline"
        >
          {isLost ? '← Lost Reports' : isFound ? '← Found Reports' : '← Browse Items'}
        </Link>
      </div>

      <article className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-campus-teal">
              {typeLabel}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <h1 className="break-words text-2xl font-black tracking-tight text-campus-navy sm:text-3xl">
            {item.title}
          </h1>
        </header>

        {isLost && item.status === 'recovered' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900" role="status">
            This item has been recovered.
          </div>
        )}
        {isLost && item.status === 'open' && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900" role="status">
            Lost Item report remains open.
          </div>
        )}
        {isFound && item.status === 'pending_turnover' && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-900" role="status">
            This Found Item is awaiting turnover to SDAO.
          </div>
        )}
        {isFound && item.status === 'available_for_claim' && (
          <div className="space-y-4 rounded-xl border border-cyan-200 bg-cyan-50 p-5 text-cyan-950" role="status">
            <p className="text-sm font-medium leading-relaxed">
              This Found Item is held at SDAO and available for claim verification.
            </p>
            <div>
              <Link
                to={`/items/${item._id}/claim`}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-campus-teal px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-800"
              >
                Submit a claim
              </Link>
            </div>
          </div>
        )}
        {isFound && item.status === 'returned' && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-medium text-violet-900" role="status">
            This Found Item has been returned to its verified owner.
          </div>
        )}

        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h2>
          <p className="break-words text-sm leading-relaxed text-slate-700 whitespace-pre-line">
            {item.description || 'No description provided.'}
          </p>
        </section>

        <section className="border-t border-slate-100 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Report details</h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Category</dt>
              <dd className="mt-1 font-medium text-slate-800 break-words">{categoryName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Location</dt>
              <dd className="mt-1 font-medium text-slate-800 break-words">{locationName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{dateOccurredLabel}</dt>
              <dd className="mt-1 font-medium text-slate-800 break-words">{formattedDateOccurred}</dd>
            </div>
            {isFound && Boolean(item.claimLocation) && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Claim location</dt>
                <dd className="mt-1 font-medium text-slate-800 break-words">{item.claimLocation}</dd>
              </div>
            )}
            {formattedCreatedAt && (
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Date reported</dt>
                <dd className="mt-1 font-medium text-slate-800 break-words">{formattedCreatedAt}</dd>
              </div>
            )}
          </dl>
        </section>

        {isLost && item.status === 'open' && (
          item.category?._id ? (
            <PossibleMatchesSection source={item} />
          ) : (
            <section aria-labelledby="matches-heading" className="space-y-4 border-t border-slate-100 pt-6">
              <div>
                <h2 id="matches-heading" className="text-xl font-bold tracking-tight text-campus-navy">
                  Possible Found Item matches
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  These Found Item reports share public details with this Lost Item report. A possible match is not proof of ownership. Open a report to review its current status and follow the existing claim-verification process.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm" role="status">
                Possible matches are unavailable because this report does not have a usable category.
              </div>
            </section>
          )
        )}

        <footer className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <Link
            to={`/items/${item._id}/edit`}
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-campus-navy transition hover:bg-slate-50"
          >
            Edit report
          </Link>
          {isLost ? (
            <Link
              to="/items/lost"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-campus-teal transition hover:bg-campus-mist hover:text-campus-navy"
            >
              Back to Lost Reports
            </Link>
          ) : isFound ? (
            <Link
              to="/items/found"
              className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-campus-teal transition hover:bg-campus-mist hover:text-campus-navy"
            >
              Back to Found Reports
            </Link>
          ) : null}
          <Link
            to="/items"
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Browse all items
          </Link>
        </footer>
      </article>
    </div>
  )
}
