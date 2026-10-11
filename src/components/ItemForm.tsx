import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { itemSchema, type ItemFormValues } from '../schemas/itemSchema'
import type { NamedResource } from '../types'

type ItemFormProps = {
  categories: NamedResource[]
  locations: NamedResource[]
  isSubmitting: boolean
  submitError: string | null
  mode?: 'create' | 'edit'
  initialValues?: ItemFormValues
  onSubmit: (values: ItemFormValues) => Promise<boolean>
}

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm transition focus:border-campus-teal'
const emptyFormValues: ItemFormValues = {
  title: '',
  description: '',
  category: '',
  location: '',
  type: 'lost',
  dateOccurred: '',
}

function getTodayDateInputValue() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

export function ItemForm({
  categories,
  locations,
  isSubmitting,
  submitError,
  mode = 'create',
  initialValues,
  onSubmit,
}: ItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialValues ?? emptyFormValues,
  })

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values) && mode === 'create') reset(emptyFormValues)
  })

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="text-sm font-bold text-slate-700">Report type</label>
          {mode === 'edit' ? (
            <>
              <input type="hidden" {...register('type')} />
              <select id="type" className={fieldClass} value={initialValues?.type ?? 'lost'} disabled>
                <option value="lost">I lost an item</option>
                <option value="found">I found an item</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">Report type is locked after creation to preserve its workflow.</p>
            </>
          ) : (
            <select id="type" className={fieldClass} {...register('type')} aria-invalid={Boolean(errors.type)}>
              <option value="lost">I lost an item</option>
              <option value="found">I found an item</option>
            </select>
          )}
          {errors.type && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.type.message}</p>}
        </div>
        <div>
          <label htmlFor="title" className="text-sm font-bold text-slate-700">Item name</label>
          <input id="title" maxLength={120} className={fieldClass} placeholder="For example, black wallet" {...register('title')} aria-invalid={Boolean(errors.title)} />
          {errors.title && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.title.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-bold text-slate-700">Description</label>
        <textarea id="description" rows={4} maxLength={1200} className={fieldClass} placeholder="Add useful identifying details without including private contact information." {...register('description')} aria-invalid={Boolean(errors.description)} />
        {errors.description && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.description.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="text-sm font-bold text-slate-700">Category</label>
          <select id="category" className={fieldClass} defaultValue={initialValues?.category ?? ''} {...register('category')} aria-invalid={Boolean(errors.category)}>
            <option value="" disabled>Select a category</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          {errors.category && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.category.message}</p>}
        </div>
        <div>
          <label htmlFor="location" className="text-sm font-bold text-slate-700">Campus location</label>
          <select id="location" className={fieldClass} defaultValue={initialValues?.location ?? ''} {...register('location')} aria-invalid={Boolean(errors.location)}>
            <option value="" disabled>Select a location</option>
            {locations.map((location) => <option key={location._id} value={location._id}>{location.name}</option>)}
          </select>
          {errors.location && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.location.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="dateOccurred" className="text-sm font-bold text-slate-700">Date lost or found</label>
        <input id="dateOccurred" type="date" max={getTodayDateInputValue()} className={fieldClass} {...register('dateOccurred')} aria-invalid={Boolean(errors.dateOccurred)} />
        {errors.dateOccurred && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.dateOccurred.message}</p>}
      </div>

      {submitError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800" role="alert">{submitError}</div>}

      <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-campus-teal px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {isSubmitting ? (mode === 'edit' ? 'Saving changes…' : 'Submitting report…') : (mode === 'edit' ? 'Save changes' : 'Submit report')}
      </button>
    </form>
  )
}
