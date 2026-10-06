import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingState, StatePanel } from '../components/PageStates'
import { StatusBadge } from '../components/StatusBadge'
import { useApiResource } from '../hooks/useApiResource'
import type { Claim, Item, SdaoOverview } from '../types'
import { formatDate } from '../utils/format'

type PendingAction = {
  kind: 'turnover' | 'return'
  item: Item
} | null

function EmptySection({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">{message}</p>
}

function ItemRow({ item, action }: { item: Item; action?: ReactNode }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-extrabold text-campus-navy">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{item.location?.name ?? 'Location unavailable'} · {formatDate(item.dateOccurred, { dateStyle: 'medium' })}</p>
      </div>
      {action}
    </article>
  )
}

function ClaimRow({ claim }: { claim: Claim }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold text-campus-navy">{claim.item.title}</h3>
          <StatusBadge status={claim.status} />
        </div>
        <p className="mt-1 break-all text-sm text-slate-500">{claim.referenceCode} · submitted {formatDate(claim.createdAt, { dateStyle: 'medium' })}</p>
      </div>
      <Link to={`/sdao/claims/${claim._id}`} className="shrink-0 rounded-lg bg-campus-navy px-3.5 py-2 text-center text-sm font-bold text-white hover:bg-slate-700">Review claim</Link>
    </article>
  )
}

export function SdaoManagementPage() {
  const { data, isLoading, error, reload } = useApiResource<SdaoOverview>('/sdao/overview')
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [isActing, setIsActing] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  const runAction = async () => {
    if (!pendingAction) return
    setIsActing(true)
    setFeedback(null)
    try {
      const path = pendingAction.kind === 'turnover'
        ? `/sdao/items/${pendingAction.item._id}/turnover`
        : `/sdao/items/${pendingAction.item._id}/return`
      const response = await api.patch<{ message: string }>(path)
      setFeedback({ tone: 'success', message: response.data.message })
      setPendingAction(null)
      reload()
    } catch (requestError) {
      setFeedback({ tone: 'error', message: getErrorMessage(requestError) })
      setPendingAction(null)
    } finally {
      setIsActing(false)
    }
  }

  if (isLoading) return <LoadingState label="Loading the SDAO workflow" />
  if (error) return <StatePanel title="SDAO overview unavailable" message={error} tone="error" action={<button onClick={reload} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>} />
  if (!data) return <StatePanel title="No workflow data" message="The SDAO overview returned no data." />

  const metrics = [
    ['Awaiting turnover', data.counts.awaitingTurnover],
    ['Available for claim', data.counts.availableForClaim],
    ['Pending claims', data.counts.pendingClaims],
    ['Approved claims', data.counts.approvedClaims],
    ['Returned items', data.counts.returnedItems],
  ] as const

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-campus-teal">Operations workspace</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-campus-navy">SDAO management</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">Confirm custody, review ownership evidence, and release items only after the required workflow checks pass.</p>
      </header>

      {feedback && <StatePanel title={feedback.tone === 'success' ? 'Workflow updated' : 'Update failed'} message={feedback.message} tone={feedback.tone} />}

      <section aria-label="Workflow totals" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-3xl font-black text-campus-navy">{value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
          <h2 className="text-xl font-black text-campus-navy">Awaiting turnover</h2>
          <p className="mt-1 text-sm text-slate-500">Found reports that have not yet entered SDAO custody.</p>
          <div className="mt-4 space-y-3">
            {data.awaitingTurnover.length === 0 ? <EmptySection message="No items are waiting for turnover." /> : data.awaitingTurnover.map((item) => (
              <ItemRow key={item._id} item={item} action={<button onClick={() => setPendingAction({ kind: 'turnover', item })} className="shrink-0 rounded-lg bg-campus-teal px-3.5 py-2 text-sm font-bold text-white hover:bg-teal-800">Confirm turnover</button>} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
          <h2 className="text-xl font-black text-campus-navy">Available for claim</h2>
          <p className="mt-1 text-sm text-slate-500">Items in SDAO custody that currently accept claims.</p>
          <div className="mt-4 space-y-3">
            {data.availableForClaim.length === 0 ? <EmptySection message="No items are available for claim." /> : data.availableForClaim.map((item) => (
              <ItemRow key={item._id} item={item} action={<Link to={`/items/${item._id}/claim`} className="shrink-0 rounded-lg border border-campus-teal px-3.5 py-2 text-center text-sm font-bold text-campus-teal hover:bg-campus-mist">Open claim form</Link>} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
          <h2 className="text-xl font-black text-campus-navy">Pending claims</h2>
          <p className="mt-1 text-sm text-slate-500">Private proof requires an approve or reject decision.</p>
          <div className="mt-4 space-y-3">
            {data.pendingClaims.length === 0 ? <EmptySection message="No claims are waiting for review." /> : data.pendingClaims.map((claim) => <ClaimRow key={claim._id} claim={claim} />)}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm">
          <h2 className="text-xl font-black text-campus-navy">Approved claims</h2>
          <p className="mt-1 text-sm text-slate-500">Approved ownership checks waiting for physical release.</p>
          <div className="mt-4 space-y-3">
            {data.approvedClaims.length === 0 ? <EmptySection message="No approved claims are waiting for return." /> : data.approvedClaims.map((claim) => (
              <article key={claim._id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-campus-navy">{claim.item.title}</h3><StatusBadge status={claim.status} /></div>
                    <p className="mt-1 break-all text-sm text-slate-500">{claim.referenceCode}</p>
                  </div>
                  {claim.item.status === 'Available for Claim' ? (
                    <button onClick={() => setPendingAction({ kind: 'return', item: claim.item })} className="shrink-0 rounded-lg bg-campus-gold px-3.5 py-2 text-sm font-bold text-campus-navy hover:bg-amber-300">Mark returned</button>
                  ) : <StatusBadge status={claim.item.status} />}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm xl:col-span-2">
          <h2 className="text-xl font-black text-campus-navy">Returned items</h2>
          <p className="mt-1 text-sm text-slate-500">Completed Found-item recoveries retained for traceability.</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {data.returnedItems.length === 0 ? <EmptySection message="No items have been returned yet." /> : data.returnedItems.map((item) => <ItemRow key={item._id} item={item} />)}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.kind === 'turnover' ? 'Confirm SDAO turnover' : 'Confirm item return'}
        message={pendingAction?.kind === 'turnover'
          ? `Confirm that SDAO physically received “${pendingAction.item.title}”. This will make it available for claims.`
          : `Confirm that “${pendingAction?.item.title ?? ''}” was released to the approved claimant. This will close the Found-item workflow.`}
        confirmLabel={pendingAction?.kind === 'turnover' ? 'Confirm turnover' : 'Mark returned'}
        isBusy={isActing}
        onConfirm={runAction}
        onCancel={() => !isActing && setPendingAction(null)}
      />
    </div>
  )
}
