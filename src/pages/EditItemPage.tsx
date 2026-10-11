import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { ItemForm } from '../components/ItemForm'
import { LoadingState, StatePanel } from '../components/PageStates'
import { useApiResource } from '../hooks/useApiResource'
import type { ItemFormValues } from '../schemas/itemSchema'
import type { Item, NamedResource } from '../types'

function includeCurrentResource(resources: NamedResource[], current?: NamedResource) {
  if (!current || resources.some((resource) => resource._id === current._id)) return resources
  return [...resources, current]
}

export function EditItemPage() {
  const { id } = useParams()
  const itemResource = useApiResource<Item>(id ? `/items/${id}` : null)
  const categories = useApiResource<NamedResource[]>('/categories')
  const locations = useApiResource<NamedResource[]>('/locations')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleted, setIsDeleted] = useState(false)

  const item = itemResource.data
  const categoryOptions = useMemo(
    () => includeCurrentResource(categories.data ?? [], item?.category),
    [categories.data, item?.category],
  )
  const locationOptions = useMemo(
    () => includeCurrentResource(locations.data ?? [], item?.location),
    [locations.data, item?.location],
  )
  const initialValues: ItemFormValues | undefined = item ? {
    title: item.title,
    description: item.description ?? '',
    category: item.category?._id ?? '',
    location: item.location?._id ?? '',
    type: item.type,
    dateOccurred: item.dateOccurred.slice(0, 10),
  } : undefined

  const saveChanges = async (values: ItemFormValues) => {
    if (!id) return false
    setSubmitError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)
    try {
      const response = await api.patch<{ data: Item; message?: string }>(`/items/${id}`, values)
      setSuccessMessage(response.data.message ?? 'Item report updated successfully.')
      return true
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteItem = async () => {
    if (!id) return
    setDeleteError(null)
    setIsDeleting(true)
    try {
      await api.delete(`/items/${id}`)
      setIsDeleted(true)
      setShowDeleteConfirmation(false)
    } catch (error) {
      setDeleteError(getErrorMessage(error))
      setShowDeleteConfirmation(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!id) return <StatePanel title="Item unavailable" message="No item ID was provided." tone="error" />
  if (itemResource.isLoading) return <LoadingState label="Loading item report" />
  if (itemResource.error) {
    return <StatePanel title="Unable to load item report" message={itemResource.error} tone="error" action={<button onClick={itemResource.reload} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>} />
  }
  if (!item) return <StatePanel title="Item unavailable" message="This report could not be found." tone="error" />

  if (isDeleted) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <StatePanel title="Report deleted" message="The item report and its activity entries were deleted successfully." tone="success" />
        <Link to="/items" className="inline-flex min-h-11 items-center rounded-xl bg-campus-teal px-5 py-3 text-sm font-extrabold text-white hover:bg-teal-800">Back to Browse Items</Link>
      </div>
    )
  }

  const referencesLoading = categories.isLoading || locations.isLoading
  const referenceError = categories.error || locations.error

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-campus-teal">Manage report</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-campus-navy">Edit item</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Update this report’s details. Its Lost or Found type and workflow status stay protected.</p>
      </header>

      {successMessage && <StatePanel title="Changes saved" message={successMessage} tone="success" />}
      {deleteError && <StatePanel title="Report not deleted" message={deleteError} tone="error" />}
      {referencesLoading && <LoadingState label="Loading categories and campus locations" />}
      {!referencesLoading && referenceError && (
        <StatePanel
          title="Could not load report options"
          message={referenceError}
          tone="error"
          action={<button onClick={() => { categories.reload(); locations.reload() }} className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white">Try again</button>}
        />
      )}
      {!referencesLoading && !referenceError && (!categoryOptions.length || !locationOptions.length) && (
        <StatePanel title="Report options unavailable" message="A category and campus location are needed to edit this report." />
      )}
      {!referencesLoading && !referenceError && Boolean(categoryOptions.length && locationOptions.length && initialValues) && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <ItemForm
              key={item._id}
              categories={categoryOptions}
              locations={locationOptions}
              initialValues={initialValues}
              mode="edit"
              isSubmitting={isSubmitting}
              submitError={submitError}
              onSubmit={saveChanges}
            />
          </section>
          <section className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-extrabold text-rose-950">Delete this report</h2>
              <p className="mt-1 text-sm leading-6 text-rose-800">Reports with claim history can’t be deleted. Deleting this report also removes its activity entries.</p>
            </div>
            <button type="button" onClick={() => setShowDeleteConfirmation(true)} disabled={isSubmitting || isDeleting} className="min-h-11 shrink-0 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-extrabold text-rose-800 transition hover:bg-rose-100 disabled:opacity-50">
              Delete report
            </button>
          </section>
        </>
      )}

      <ConfirmDialog
        open={showDeleteConfirmation}
        title="Delete this item report?"
        message={`Delete “${item.title}”? This permanently removes the report and its activity entries. Reports with claim history cannot be deleted.`}
        confirmLabel="Delete report"
        isBusy={isDeleting}
        tone="danger"
        onConfirm={deleteItem}
        onCancel={() => { if (!isDeleting) setShowDeleteConfirmation(false) }}
      />
    </div>
  )
}
