import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Module Home', end: true },
  { to: '/items', label: 'Browse Items', end: true },
  { to: '/report', label: 'Report Item', end: true },
  { to: '/references', label: 'Manage References', end: true },
  { to: '/sdao', label: 'SDAO Management' },
  { to: '/activity', label: 'Activity History' },
]

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2f1ef,_#f7faf9_42%)]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <NavLink to="/" className="group flex items-center gap-3 text-campus-navy no-underline">
            <span className="grid size-10 place-items-center rounded-xl bg-campus-navy text-lg font-black text-white shadow-sm transition group-hover:bg-campus-teal">CF</span>
            <span>
              <span className="block text-lg font-extrabold tracking-tight">CampusFind</span>
              <span className="block text-xs font-medium text-slate-500">Claims and SDAO workflow</span>
            </span>
          </NavLink>

            <nav aria-label="Primary navigation" className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 rounded-xl bg-slate-100 p-1 lg:w-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `grid min-h-11 place-items-center rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight transition sm:text-sm ${isActive ? 'bg-white text-campus-navy shadow-sm' : 'text-slate-600 hover:text-campus-teal'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          CampusFind routes recoveries through the project-designated SDAO claim location.
        </div>
      </footer>
    </div>
  )
}
