const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-900',
  Approved: 'bg-emerald-100 text-emerald-900',
  Rejected: 'bg-rose-100 text-rose-900',
  'Pending Turnover': 'bg-orange-100 text-orange-900',
  'Available for Claim': 'bg-cyan-100 text-cyan-900',
  Returned: 'bg-violet-100 text-violet-900',
  Open: 'bg-blue-100 text-blue-900',
  Recovered: 'bg-emerald-100 text-emerald-900',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  )
}
