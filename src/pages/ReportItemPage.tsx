import { useState } from 'react'
import { api, getErrorMessage } from '../api/client'
import { ItemForm } from '../components/ItemForm'
import { LoadingState, StatePanel } from '../components/PageStates'
import { useApiResource } from '../hooks/useApiResource'
import type { ItemFormValues } from '../schemas/itemSchema'
import type { Item, NamedResource } from '../types'

export function ReportItemPage() {
  const categories = useApiResource<NamedResource[]>('/categories')
  const locations = useApiResource<NamedResource[]>('/locations')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const submitReport = async (values: ItemFormValues) => {
    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)
    try {
      const response = await api.post<{ data: Item; message?: string }>('/items', values)
      setSuccessMessage(response.data.message ?? 'Your report was submitted successfully.')
      return true
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const referenceError = categories.error || locations.error
  const referencesLoading = categories.isLoading || locations.isLoading

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-campus-teal">Campus Lost and Found</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-campus-navy">Report an item</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Share what was lost or found so it can be included in CampusFind. Found items are routed through the designated SDAO claim location.</p>
      </header>

      {successMessage && <StatePanel title="Report submitted" message={successMessage} tone="success" />}
      {referencesLoading && <LoadingState label="Loading categories and campus locations" />}
      {!referencesLoading && referenceError && (
        <StatePanel
          title="Could not load report options"
          message={referenceError}
          tone="error"
          action={<button onClick={() => { categories.reload(); locations.reload() }} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>}
        />
      )}
      {!referencesLoading && !referenceError && (!categories.data?.length || !locations.data?.length) && (
        <StatePanel title="Report options unavailable" message="A category and campus location are needed before a report can be submitted. Please try again later." />
      )}
      {!referencesLoading && !referenceError && Boolean(categories.data?.length && locations.data?.length) && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <ItemForm
            categories={categories.data ?? []}
            locations={locations.data ?? []}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onSubmit={submitReport}
          />
        </section>
      )}
    </div>
  )
}
