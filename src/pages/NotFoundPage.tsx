import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-campus-teal">404</p>
      <h1 className="mt-3 text-4xl font-black text-campus-navy">Page not found</h1>
      <p className="mt-4 leading-7 text-slate-600">The requested CampusFind page does not exist or may have moved.</p>
      <Link to="/member3" className="mt-7 inline-flex rounded-xl bg-campus-navy px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-700">Return to module home</Link>
    </section>
  )
}
