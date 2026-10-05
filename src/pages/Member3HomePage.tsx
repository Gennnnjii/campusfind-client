import { Link } from 'react-router-dom'

const features = [
  {
    eyebrow: 'Claim intake',
    title: 'Privacy-conscious submission',
    description: 'Accepts claims only for eligible Found items and returns a unique reference code after server validation.',
  },
  {
    eyebrow: 'SDAO workflow',
    title: 'Rule-based review',
    description: 'Confirms turnover, reviews pending claims, closes competing claims, and blocks returns without approval.',
  },
  {
    eyebrow: 'Traceability',
    title: 'Activity history',
    description: 'Records report, turnover, claim, recovery, and return events in a filterable audit trail.',
  },
]

export function Member3HomePage() {
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-campus-navy px-6 py-10 text-white shadow-xl sm:px-10 lg:px-14 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-200">CampusFind operations</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A safer path from found item to verified return.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            This module keeps private claim details inside the project-designated SDAO workflow while enforcing every turnover, approval, rejection, and return rule on the server.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/sdao" className="rounded-xl bg-campus-gold px-5 py-3 text-center text-sm font-extrabold text-campus-navy shadow-sm transition hover:bg-amber-300">
              Open SDAO management
            </Link>
            <Link to="/activity" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-center text-sm font-extrabold text-white transition hover:bg-white/20">
              View activity history
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow-heading">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-campus-teal">Member 3 scope</p>
          <h2 id="workflow-heading" className="mt-2 text-3xl font-black tracking-tight text-campus-navy">Claims, SDAO, and accountability</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-campus-teal">{feature.eyebrow}</p>
                <span className="grid size-9 place-items-center rounded-full bg-campus-mist text-sm font-black text-campus-navy">{index + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-campus-navy">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
