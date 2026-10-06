const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
  pending_turnover: 'bg-orange-100 text-orange-900',
  available_for_claim: 'bg-cyan-100 text-cyan-900',
  returned: 'bg-violet-100 text-violet-900',
  open: 'bg-blue-100 text-blue-900',
  recovered: 'bg-emerald-100 text-emerald-900',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  pending_turnover: 'Pending Turnover',
  available_for_claim: 'Available for Claim',
  returned: 'Returned',
  open: 'Open',
  recovered: 'Recovered',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {statusLabels[status] ?? status}
    </span>
  )
}
