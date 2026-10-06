import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadingState, StatePanel } from '../components/PageStates'
import { StatusBadge } from '../components/StatusBadge'
import { useApiResource } from '../hooks/useApiResource'
import type { ActivityAction, ActivityLog } from '../types'
import { formatDate } from '../utils/format'

const actionLabels: Record<ActivityAction, string> = {
  report_created: 'Report created',
  turnover_confirmed: 'Turnover confirmed',
  claim_submitted: 'Claim submitted',
  claim_approved: 'Claim approved',
  claim_rejected: 'Claim rejected',
  item_returned: 'Item returned',
  item_recovered: 'Item recovered',
}

const actionColors: Record<ActivityAction, string> = {
  report_created: 'bg-blue-500',
  turnover_confirmed: 'bg-cyan-600',
  claim_submitted: 'bg-amber-500',
  claim_approved: 'bg-emerald-600',
  claim_rejected: 'bg-rose-600',
  item_returned: 'bg-violet-600',
  item_recovered: 'bg-teal-600',
}

export function ActivityHistoryPage() {
  const [action, setAction] = useState<ActivityAction | ''>('')
  const path = useMemo(() => `/activity-logs?limit=100${action ? `&action=${action}` : ''}`, [action])
  const { data, isLoading, error, reload } = useApiResource<ActivityLog[]>(path)

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-campus-teal">Traceability</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-campus-navy">Activity history</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">A chronological record of the important events that move reports, claims, and returns through CampusFind.</p>
        </div>
        <label className="text-sm font-bold text-slate-700">
          Filter by event
          <select value={action} onChange={(event) => setAction(event.target.value as ActivityAction | '')} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium shadow-sm lg:w-64">
            <option value="">All events</option>
            {Object.entries(actionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </header>

      {isLoading && <LoadingState label="Loading activity history" />}
      {error && <StatePanel title="Activity history unavailable" message={error} tone="error" action={<button onClick={reload} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>} />}
      {!isLoading && !error && data?.length === 0 && <StatePanel title="No activity yet" message={action ? 'No events match this filter.' : 'Important workflow events will appear here once reports and claims move through the system.'} />}

      {!isLoading && !error && data && data.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-label={`${data.length} activity events`}>
          <div className="space-y-1">
            {data.map((log, index) => (
              <article key={log._id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                <div className="flex flex-col items-center">
                  <span className={`mt-1.5 size-3 rounded-full ring-4 ring-white ${actionColors[log.action]}`} />
                  {index < data.length - 1 && <span className="h-full min-h-16 w-px bg-slate-200" />}
                </div>
                <div className="min-w-0 pb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-campus-teal">{actionLabels[log.action]}</p>
                    <StatusBadge status={log.item.status} />
                  </div>
                  <h2 className="mt-1 text-lg font-extrabold text-campus-navy">{log.item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{log.message}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                    <time dateTime={log.createdAt}>{formatDate(log.createdAt)}</time>
                    {log.claim && <Link to={`/sdao/claims/${log.claim._id}`} className="break-all font-bold text-campus-teal hover:underline">{log.claim.referenceCode}</Link>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
