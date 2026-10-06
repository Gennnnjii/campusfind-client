import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import { LoadingState, StatePanel } from '../components/PageStates'
import { StatusBadge } from '../components/StatusBadge'
import { useApiResource } from '../hooks/useApiResource'
import { claimSchema, type ClaimFormValues } from '../schemas/claimSchema'
import type { Claim, Item } from '../types'
import { formatDate } from '../utils/format'

type Eligibility = {
  item: Item
  eligible: boolean
  reason: string | null
}

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-campus-teal'

export function SubmitClaimPage() {
  const { id } = useParams()
  const { data, isLoading, error, reload } = useApiResource<Eligibility>(id ? `/items/${id}/claim-eligibility` : null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedClaim, setSubmittedClaim] = useState<Claim | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClaimFormValues>({ resolver: zodResolver(claimSchema) })

  const onSubmit = handleSubmit(async (values) => {
    if (!id) return
    setSubmitError(null)
    try {
      const response = await api.post<{ data: Claim }>('/claims', { item: id, ...values })
      setSubmittedClaim(response.data.data)
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError))
    }
  })

  if (isLoading) return <LoadingState label="Checking claim eligibility" />
  if (error) {
    return <StatePanel title="Unable to open this claim form" message={error} tone="error" action={<button onClick={reload} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>} />
  }
  if (!data) return <StatePanel title="Item unavailable" message="No item was selected for this claim." tone="error" />

  if (submittedClaim) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <StatePanel
          title="Claim submitted successfully"
          message="Save this reference code. SDAO will use it to identify your claim without exposing your private proof on the public item page."
          tone="success"
        />
        <section className="rounded-3xl bg-campus-navy p-7 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">Claim reference</p>
          <p className="mt-3 whitespace-nowrap font-mono text-xl font-black tracking-normal sm:text-4xl sm:tracking-wide">{submittedClaim.referenceCode}</p>
          <p className="mt-5 text-sm leading-6 text-slate-200">Status: Pending. Bring proof of ownership to {submittedClaim.item.claimLocation || 'SDAO'} for physical verification.</p>
        </section>
        <Link to="/member3" className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-campus-navy shadow-sm hover:bg-slate-50">Return to module home</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <aside className="h-fit rounded-3xl bg-campus-navy p-6 text-white shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">Claiming</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">{data.item.title}</h1>
        <div className="mt-4"><StatusBadge status={data.item.status} /></div>
        <dl className="mt-6 space-y-4 text-sm">
          <div><dt className="font-bold text-slate-300">Category</dt><dd className="mt-1">{data.item.category?.name ?? 'Not specified'}</dd></div>
          <div><dt className="font-bold text-slate-300">Found at</dt><dd className="mt-1">{data.item.location?.name ?? 'Not specified'}</dd></div>
          <div><dt className="font-bold text-slate-300">Date reported</dt><dd className="mt-1">{formatDate(data.item.dateOccurred, { dateStyle: 'long' })}</dd></div>
          <div><dt className="font-bold text-slate-300">Claim location</dt><dd className="mt-1">{data.item.claimLocation}</dd></div>
        </dl>
        <p className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200">Finder contact details and private verification notes are never displayed here. Recovery happens through the designated claim location.</p>
      </aside>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-campus-teal">Ownership verification request</p>
        <h2 className="mt-2 text-2xl font-black text-campus-navy">Submit a claim</h2>
        {!data.eligible ? (
          <div className="mt-6"><StatePanel title="Claims are closed" message={data.reason ?? 'This item is not eligible for claims.'} tone="error" /></div>
        ) : (
          <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
            <div>
              <label htmlFor="claimantName" className="text-sm font-bold text-slate-700">Full name</label>
              <input id="claimantName" autoComplete="name" className={fieldClass} {...register('claimantName')} aria-invalid={Boolean(errors.claimantName)} />
              {errors.claimantName && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.claimantName.message}</p>}
            </div>
            <div>
              <label htmlFor="claimantEmail" className="text-sm font-bold text-slate-700">School email</label>
              <input id="claimantEmail" type="email" autoComplete="email" className={fieldClass} {...register('claimantEmail')} aria-invalid={Boolean(errors.claimantEmail)} />
              {errors.claimantEmail && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.claimantEmail.message}</p>}
            </div>
            <div>
              <label htmlFor="proofDescription" className="text-sm font-bold text-slate-700">Private identifying details</label>
              <p className="mt-1 text-xs leading-5 text-slate-500">Describe a distinctive mark, contents, or another detail not shown publicly. Do not enter passwords or financial information.</p>
              <textarea id="proofDescription" rows={6} className={fieldClass} placeholder="Example: a small initials label inside the left compartment…" {...register('proofDescription')} aria-invalid={Boolean(errors.proofDescription)} />
              {errors.proofDescription && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.proofDescription.message}</p>}
            </div>
            {submitError && <StatePanel title="Claim not submitted" message={submitError} tone="error" />}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-campus-teal px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Submitting claim…' : 'Submit claim securely'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
