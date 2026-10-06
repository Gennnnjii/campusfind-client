import type { ReactNode } from 'react'

type StatePanelProps = {
  title: string
  message: string
  tone?: 'neutral' | 'error' | 'success'
  action?: ReactNode
}

export function StatePanel({ title, message, tone = 'neutral', action }: StatePanelProps) {
  const styles = {
    neutral: 'border-slate-200 bg-white text-slate-700',
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </section>
  )
}

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-600 shadow-sm" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-campus-teal" aria-hidden="true" />
      {label}…
    </div>
  )
}
