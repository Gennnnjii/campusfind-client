type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  isBusy?: boolean
  tone?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  isBusy = false,
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={onCancel}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-xl font-extrabold text-campus-navy">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={isBusy} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={isBusy} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${tone === 'danger' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-campus-teal hover:bg-teal-800'}`}>
            {isBusy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
