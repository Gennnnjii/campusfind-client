import { useState, type FormEvent } from 'react'
import { api, getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { LoadingState, StatePanel } from '../components/PageStates'
import { useApiResource } from '../hooks/useApiResource'
import type { NamedResource } from '../types'

type ReferenceKind = 'categories' | 'locations'
type ReferenceResponse = { data: NamedResource; message?: string }

const referenceLabels: Record<ReferenceKind, string> = {
  categories: 'Category',
  locations: 'Campus location',
}
const referencePluralLabels: Record<ReferenceKind, string> = {
  categories: 'Categories',
  locations: 'Campus locations',
}

export function ReferenceManagementPage() {
  const [kind, setKind] = useState<ReferenceKind>('categories')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [referenceToToggle, setReferenceToToggle] = useState<NamedResource | null>(null)
  const [isToggling, setIsToggling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const categories = useApiResource<NamedResource[]>('/categories?includeInactive=true')
  const locations = useApiResource<NamedResource[]>('/locations?includeInactive=true')
  const resource = kind === 'categories' ? categories : locations
  const label = referenceLabels[kind]

  const clearForm = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setFormError(null)
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)
    try {
      const payload = { name, description }
      const response = editingId
        ? await api.patch<ReferenceResponse>(`/${kind}/${editingId}`, payload)
        : await api.post<ReferenceResponse>(`/${kind}`, payload)
      setSuccessMessage(response.data.message ?? `${label} saved successfully.`)
      clearForm()
      resource.reload()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActive = async () => {
    if (!referenceToToggle) return
    const activate = referenceToToggle.isActive === false
    setActionError(null)
    setSuccessMessage(null)
    setIsToggling(true)
    try {
      const response = activate
        ? await api.patch<ReferenceResponse>(`/${kind}/${referenceToToggle._id}`, { isActive: true })
        : await api.delete<ReferenceResponse>(`/${kind}/${referenceToToggle._id}`)
      setSuccessMessage(response.data.message ?? `${label} status updated.`)
      setReferenceToToggle(null)
      resource.reload()
    } catch (error) {
      setActionError(getErrorMessage(error))
      setReferenceToToggle(null)
    } finally {
      setIsToggling(false)
    }
  }

  const beginEdit = (reference: NamedResource) => {
    setEditingId(reference._id)
    setName(reference.name)
    setDescription(reference.description ?? '')
    setFormError(null)
    setSuccessMessage(null)
  }

  const loading = categories.isLoading || locations.isLoading
  const loadError = categories.error || locations.error
  const records = resource.data ?? []

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-campus-teal">Reference data</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-campus-navy">Manage categories and locations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Create and update the choices used in item reports. Deactivation preserves existing item references; inactive entries can be reactivated later.</p>
      </header>

      {successMessage && <StatePanel title="Saved" message={successMessage} tone="success" />}
      {actionError && <StatePanel title="Could not update reference" message={actionError} tone="error" />}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <h2 className="text-lg font-extrabold text-campus-navy">{editingId ? `Edit ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Reference type">
              {(['categories', 'locations'] as const).map((option) => (
                <button key={option} type="button" role="tab" aria-selected={kind === option} onClick={() => { setKind(option); clearForm() }} className={`min-h-10 rounded-lg px-3 text-sm font-bold ${kind === option ? 'bg-white text-campus-navy shadow-sm' : 'text-slate-600 hover:text-campus-teal'}`}>
                  {referencePluralLabels[option]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submitForm} className="space-y-4">
            <div>
              <label htmlFor="reference-name" className="text-sm font-bold text-slate-700">Name</label>
              <input id="reference-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm shadow-sm focus:border-campus-teal" />
            </div>
            <div>
              <label htmlFor="reference-description" className="text-sm font-bold text-slate-700">Description <span className="font-normal text-slate-500">(optional)</span></label>
              <textarea id="reference-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm shadow-sm focus:border-campus-teal" />
            </div>
            {formError && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800" role="alert">{formError}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={isSubmitting} className="min-h-11 rounded-xl bg-campus-teal px-4 py-2.5 text-sm font-extrabold text-white hover:bg-teal-800 disabled:opacity-60">
                {isSubmitting ? 'Saving…' : editingId ? 'Save changes' : `Add ${label.toLowerCase()}`}
              </button>
              {editingId && <button type="button" onClick={clearForm} disabled={isSubmitting} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel edit</button>}
            </div>
          </form>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-campus-navy">{label} list</h2>
              <p className="mt-1 text-sm text-slate-500">Active and inactive records</p>
            </div>
            <button type="button" onClick={resource.reload} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Refresh</button>
          </div>

          {loading && <LoadingState label="Loading categories and locations" />}
          {!loading && loadError && <StatePanel title="Unable to load reference data" message={loadError} tone="error" action={<button onClick={() => { categories.reload(); locations.reload() }} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>} />}
          {!loading && !loadError && records.length === 0 && <StatePanel title={`No ${referencePluralLabels[kind].toLowerCase()} yet`} message={`Add a ${label.toLowerCase()} to make it available for new item reports.`} />}
          {!loading && !loadError && records.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {records.map((record) => (
                <li key={record._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words font-bold text-campus-navy">{record.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${record.isActive === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'}`}>{record.isActive === false ? 'Inactive' : 'Active'}</span>
                    </div>
                    {record.description && <p className="mt-1 break-words text-sm text-slate-600">{record.description}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => beginEdit(record)} className="min-h-10 rounded-lg px-3 text-sm font-bold text-campus-teal hover:bg-campus-mist">Edit</button>
                    <button type="button" onClick={() => setReferenceToToggle(record)} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">{record.isActive === false ? 'Reactivate' : 'Deactivate'}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(referenceToToggle)}
        title={referenceToToggle?.isActive === false ? `Reactivate this ${label.toLowerCase()}?` : `Deactivate this ${label.toLowerCase()}?`}
        message={referenceToToggle?.isActive === false
          ? `“${referenceToToggle.name}” will be available for new item reports again.`
          : `“${referenceToToggle?.name}” will be hidden from new item reports. Existing item records will keep their reference.`}
        confirmLabel={referenceToToggle?.isActive === false ? 'Reactivate' : 'Deactivate'}
        isBusy={isToggling}
        onConfirm={toggleActive}
        onCancel={() => { if (!isToggling) setReferenceToToggle(null) }}
      />
    </div>
  )
}
