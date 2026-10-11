import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-campus-navy px-6 py-10 text-white shadow-xl sm:px-10 lg:px-14 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-200">
            Campus Lost and Found System
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Reuniting campus possessions through verified recovery.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            CampusFind centralizes reports for lost and found items across campus, helping students and staff search active listings, submit reports, and complete verified returns through the designated SDAO office.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/items"
              className="grid min-h-11 place-items-center rounded-xl bg-campus-gold px-6 py-3 text-center text-sm font-extrabold text-campus-navy shadow-sm transition hover:bg-amber-300"
            >
              Browse Items
            </Link>
            <Link
              to="/report"
              className="grid min-h-11 place-items-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-center text-sm font-extrabold text-white transition hover:bg-white/20"
            >
              Report an Item
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="capabilities-heading">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-campus-teal">
            Core Capabilities
          </p>
          <h2 id="capabilities-heading" className="mt-2 text-2xl font-black tracking-tight text-campus-navy sm:text-3xl">
            How CampusFind Works
          </h2>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-campus-teal">Discovery</p>
              <span className="grid size-9 place-items-center rounded-full bg-campus-mist text-sm font-black text-campus-navy">1</span>
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-campus-navy">Browse and Search</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Browse lost and found reports across campus with instant category, location, and status filters.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-campus-teal">Reporting</p>
              <span className="grid size-9 place-items-center rounded-full bg-campus-mist text-sm font-black text-campus-navy">2</span>
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-campus-navy">Report and Match</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Submit new lost or found item reports and review automated similarity scoring against existing listings.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-campus-teal">Resolution</p>
              <span className="grid size-9 place-items-center rounded-full bg-campus-mist text-sm font-black text-campus-navy">3</span>
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-campus-navy">Claim and Resolve</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Submit privacy-conscious ownership claims and support verified physical turnover at the designated SDAO location.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
