import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingState, StatePanel } from '../components/PageStates'
import { StatusBadge } from '../components/StatusBadge'
import { useApiResource } from '../hooks/useApiResource'
import { reviewSchema, type ReviewFormValues } from '../schemas/claimSchema'
import type { Claim } from '../types'
import { daysSince, formatDate } from '../utils/format'

export function ClaimReviewPage() {
  const { id } = useParams()
  const { data: claim, isLoading, error, reload } = useApiResource<Claim>(id ? `/claims/${id}` : null)
  const [pendingReview, setPendingReview] = useState<ReviewFormValues | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const { register, handleSubmit, control, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { status: 'approved', reviewNote: '' },
  })
  const selectedStatus = useWatch({ control, name: 'status' })

  const confirmReview = async () => {
    if (!claim || !pendingReview) return
    setIsSaving(true)
    try {
      const response = await api.patch<{ message: string }>(`/claims/${claim._id}/status`, pendingReview)
      setFeedback({ tone: 'success', message: response.data.message })
      setPendingReview(null)
      reload()
    } catch (requestError) {
      setFeedback({ tone: 'error', message: getErrorMessage(requestError) })
      setPendingReview(null)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingState label="Loading private claim details" />
  if (error) return <StatePanel title="Claim unavailable" message={error} tone="error" action={<button onClick={reload} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>} />
  if (!claim) return <StatePanel title="Claim not found" message="No claim was selected for review." tone="error" />

  const waitingDays = claim.status === 'pending' ? daysSince(claim.createdAt) : null

  return (
    <div className="space-y-6">
      <div><Link to="/sdao" className="text-sm font-bold text-campus-teal hover:underline">← Back to SDAO management</Link></div>
      <header className="flex flex-col gap-4 rounded-3xl bg-campus-navy p-6 text-white shadow-xl sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Private SDAO review</p>
          <h1 className="mt-3 whitespace-nowrap font-mono text-xl font-black tracking-normal sm:text-4xl sm:tracking-tight">{claim.referenceCode}</h1>
          <p className="mt-2 text-slate-200">Claim for {claim.item.title}</p>
        </div>
        <div className="flex items-center gap-3"><StatusBadge status={claim.status} />{waitingDays !== null && <span className="text-sm text-slate-300">{waitingDays} day{waitingDays === 1 ? '' : 's'} pending</span>}</div>
      </header>

      {feedback && <StatePanel title={feedback.tone === 'success' ? 'Review saved' : 'Review failed'} message={feedback.message} tone={feedback.tone} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-campus-navy">Claimant and proof</h2>
          <dl className="mt-5 space-y-5 text-sm">
            <div><dt className="font-bold text-slate-500">Claimant</dt><dd className="mt-1 text-base font-semibold text-slate-900">{claim.claimantName}</dd></div>
            <div><dt className="font-bold text-slate-500">School email</dt><dd className="mt-1 break-all text-base text-slate-900">{claim.claimantEmail}</dd></div>
            <div><dt className="font-bold text-slate-500">Submitted</dt><dd className="mt-1 text-slate-900">{formatDate(claim.createdAt)}</dd></div>
            <div><dt className="font-bold text-slate-500">Private identifying details</dt><dd className="mt-2 rounded-xl bg-amber-50 p-4 leading-6 text-amber-950">{claim.proofDescription}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-campus-navy">Reported item</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="font-bold text-slate-500">Title</dt><dd className="mt-1 font-semibold text-slate-900">{claim.item.title}</dd></div>
            <div><dt className="font-bold text-slate-500">Status</dt><dd className="mt-1"><StatusBadge status={claim.item.status} /></dd></div>
            <div><dt className="font-bold text-slate-500">Category</dt><dd className="mt-1 text-slate-900">{claim.item.category?.name ?? 'Not specified'}</dd></div>
            <div><dt className="font-bold text-slate-500">Found at</dt><dd className="mt-1 text-slate-900">{claim.item.location?.name ?? 'Not specified'}</dd></div>
            <div><dt className="font-bold text-slate-500">Occurred</dt><dd className="mt-1 text-slate-900">{formatDate(claim.item.dateOccurred, { dateStyle: 'medium' })}</dd></div>
            <div><dt className="font-bold text-slate-500">Claim location</dt><dd className="mt-1 text-slate-900">{claim.item.claimLocation}</dd></div>
          </dl>
          {claim.item.description && <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{claim.item.description}</p>}
        </section>
      </div>

      {claim.status === 'pending' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-campus-navy">Record decision</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Approving this claim automatically rejects any other pending claims for the same item. A finalized claim cannot be changed through this workflow.</p>
          <form onSubmit={handleSubmit(setPendingReview)} className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-sm font-bold text-slate-700">Decision</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {(['approved', 'rejected'] as const).map((status) => (
                  <label key={status} className={`flex items-center gap-3 rounded-xl border p-4 font-bold ${selectedStatus === status ? 'border-campus-teal bg-campus-mist text-campus-navy' : 'border-slate-200 text-slate-600'}`}>
                    <input type="radio" value={status} {...register('status')} /> {status === 'approved' ? 'Approved' : 'Rejected'}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="reviewNote" className="text-sm font-bold text-slate-700">Review note {selectedStatus === 'rejected' ? '(required)' : '(optional)'}</label>
              <textarea id="reviewNote" rows={4} {...register('reviewNote')} className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm shadow-sm focus:border-campus-teal" />
              {errors.reviewNote && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.reviewNote.message}</p>}
            </div>
            <button type="submit" className={`rounded-xl px-5 py-3 text-sm font-extrabold text-white ${selectedStatus === 'rejected' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-campus-teal hover:bg-teal-800'}`}>Continue to confirmation</button>
          </form>
        </section>
      ) : (
        <StatePanel title={`Claim ${claim.status}`} message={claim.reviewNote || `This claim was finalized on ${claim.reviewedAt ? formatDate(claim.reviewedAt) : 'an earlier date'}.`} tone={claim.status === 'approved' ? 'success' : 'neutral'} />
      )}

      <ConfirmDialog
        open={Boolean(pendingReview)}
        title={pendingReview?.status === 'approved' ? 'Approve this claim?' : 'Reject this claim?'}
        message={pendingReview?.status === 'approved' ? 'Approval is final and will automatically reject competing Pending claims for this item.' : 'Rejection is final in the current workflow. The review note will be stored with the claim.'}
        confirmLabel={pendingReview?.status === 'approved' ? 'Confirm approval' : 'Confirm rejection'}
        tone={pendingReview?.status === 'rejected' ? 'danger' : 'primary'}
        isBusy={isSaving}
        onConfirm={confirmReview}
        onCancel={() => !isSaving && setPendingReview(null)}
      />
    </div>
  )
}
