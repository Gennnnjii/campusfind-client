import { LoadingState, StatePanel } from '../components/PageStates'
import { useStatistics } from '../hooks/useStatistics'

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function DashboardPage() {
  const { overview, categories, locations, resolution, isRefreshing, reloadAll } = useStatistics()

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-campus-teal">Campus Insights</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-campus-navy sm:text-4xl">CampusFind Analytics</h1>
          <p className="mt-2 text-base text-slate-600">Campus-wide statistics, recovery rates, and report distribution.</p>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={reloadAll}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center rounded-xl bg-campus-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-campus-teal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh all'}
          </button>
        </div>
      </header>

      {/* Overview Section */}
      <section aria-labelledby="overview-heading" className="space-y-4">
        <h2 id="overview-heading" className="text-xl font-bold tracking-tight text-campus-navy">
          Overview
        </h2>

        {overview.isLoading && <LoadingState label="Loading overview statistics" />}

        {overview.error && (
          <StatePanel
            title="Overview statistics unavailable"
            message={overview.error}
            tone="error"
            action={
              <button
                type="button"
                onClick={overview.reload}
                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-900"
              >
                Retry
              </button>
            }
          />
        )}

        {!overview.isLoading && !overview.error && overview.data && (
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Reports</h3>
                <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy break-words">
                  {overview.data.totalItems}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">All campus items</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Lost</h3>
                <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy break-words">
                  {overview.data.activeLost}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  of {overview.data.totalLost} lost reports
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Found</h3>
                <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy break-words">
                  {overview.data.activeFound}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  of {overview.data.totalFound} found reports
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recovered Items</h3>
                <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy break-words">
                  {overview.data.recovered}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">Resolved lost reports</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Returned Items</h3>
                <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy break-words">
                  {overview.data.returned}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">Resolved found reports</p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Claims</h3>
                <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy break-words">
                  {overview.data.claims.pending}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  of {overview.data.claims.total} claims
                </p>
              </article>
            </div>

            {overview.data.totalItems === 0 && (
              <p className="mt-4 text-sm font-medium text-slate-500">
                No campus reports recorded yet.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Resolution Section */}
      <section aria-labelledby="resolution-heading" className="space-y-4">
        <h2 id="resolution-heading" className="text-xl font-bold tracking-tight text-campus-navy">
          Resolution and Recovery
        </h2>

        {resolution.isLoading && <LoadingState label="Loading resolution statistics" />}

        {resolution.error && (
          <StatePanel
            title="Resolution statistics unavailable"
            message={resolution.error}
            tone="error"
            action={
              <button
                type="button"
                onClick={resolution.reload}
                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-900"
              >
                Retry
              </button>
            }
          />
        )}

        {!resolution.isLoading && !resolution.error && resolution.data && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
              <h3 className="text-sm font-bold text-slate-700">Overall Resolution Rate</h3>
              <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy">
                {resolution.data.overallResolutionRate}%
              </p>
              <div
                className="mt-3"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clampPercent(resolution.data.overallResolutionRate)}
                aria-label={`Overall resolution rate: ${resolution.data.overallResolutionRate}%`}
              >
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-campus-teal transition-all duration-300"
                    style={{ width: `${clampPercent(resolution.data.overallResolutionRate)}%` }}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {resolution.data.resolvedReports} of {resolution.data.totalReports} reports resolved
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
              <h3 className="text-sm font-bold text-slate-700">Lost Recovery Rate</h3>
              <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy">
                {resolution.data.lost.rate}%
              </p>
              <div
                className="mt-3"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clampPercent(resolution.data.lost.rate)}
                aria-label={`Lost recovery rate: ${resolution.data.lost.rate}%`}
              >
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-campus-teal transition-all duration-300"
                    style={{ width: `${clampPercent(resolution.data.lost.rate)}%` }}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {resolution.data.lost.recovered} of {resolution.data.lost.total} lost reports recovered
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
              <h3 className="text-sm font-bold text-slate-700">Found Return Rate</h3>
              <p className="mt-3 text-3xl font-black tracking-tight text-campus-navy">
                {resolution.data.found.rate}%
              </p>
              <div
                className="mt-3"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clampPercent(resolution.data.found.rate)}
                aria-label={`Found return rate: ${resolution.data.found.rate}%`}
              >
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-campus-teal transition-all duration-300"
                    style={{ width: `${clampPercent(resolution.data.found.rate)}%` }}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {resolution.data.found.returned} of {resolution.data.found.total} found reports returned
              </p>
            </article>
          </div>
        )}
      </section>

      {/* Distribution Panels: Categories & Locations */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Category Distribution Section */}
        <section aria-labelledby="category-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
          <h2 id="category-heading" className="text-xl font-bold tracking-tight text-campus-navy">
            Category Distribution
          </h2>

          <div className="mt-5">
            {categories.isLoading && <LoadingState label="Loading category statistics" />}

            {categories.error && (
              <StatePanel
                title="Category statistics unavailable"
                message={categories.error}
                tone="error"
                action={
                  <button
                    type="button"
                    onClick={categories.reload}
                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-900"
                  >
                    Retry
                  </button>
                }
              />
            )}

            {!categories.isLoading && !categories.error && categories.data && categories.data.length === 0 && (
              <p className="text-sm font-medium text-slate-500">No category statistics available yet.</p>
            )}

            {!categories.isLoading && !categories.error && categories.data && categories.data.length > 0 && (
              <div className="space-y-4">
                {categories.data.map((item) => {
                  const key = item.categoryId ?? `category-${item.name}`
                  return (
                    <article key={key} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-bold text-campus-navy min-w-0 break-words">{item.name}</h3>
                        <span className="text-sm font-extrabold text-campus-teal">{item.percentage}%</span>
                      </div>
                      <div
                        className="mt-2"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={clampPercent(item.percentage)}
                        aria-label={`${item.name} distribution: ${item.percentage}%`}
                      >
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-campus-teal transition-all duration-300"
                            style={{ width: `${clampPercent(item.percentage)}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Total: {item.total}</span>
                        <span>Lost: {item.lost}</span>
                        <span>Found: {item.found}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Location Hotspots Section */}
        <section aria-labelledby="location-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-w-0">
          <h2 id="location-heading" className="text-xl font-bold tracking-tight text-campus-navy">
            Campus Location Hotspots
          </h2>

          <div className="mt-5">
            {locations.isLoading && <LoadingState label="Loading location statistics" />}

            {locations.error && (
              <StatePanel
                title="Location statistics unavailable"
                message={locations.error}
                tone="error"
                action={
                  <button
                    type="button"
                    onClick={locations.reload}
                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-900"
                  >
                    Retry
                  </button>
                }
              />
            )}

            {!locations.isLoading && !locations.error && locations.data && locations.data.length === 0 && (
              <p className="text-sm font-medium text-slate-500">No location statistics available yet.</p>
            )}

            {!locations.isLoading && !locations.error && locations.data && locations.data.length > 0 && (
              <div className="space-y-4">
                {locations.data.map((item) => {
                  const key = item.locationId ?? `location-${item.rank}-${item.name}`
                  return (
                    <article key={key} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-campus-mist text-xs font-bold text-campus-navy shrink-0">
                            #{item.rank}
                          </span>
                          <h3 className="text-sm font-bold text-campus-navy truncate">{item.name}</h3>
                        </div>
                        <span className="text-sm font-extrabold text-campus-navy">{item.percentage}%</span>
                      </div>
                      <div
                        className="mt-2"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={clampPercent(item.percentage)}
                        aria-label={`Rank ${item.rank} ${item.name}: ${item.percentage}%`}
                      >
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-campus-navy transition-all duration-300"
                            style={{ width: `${clampPercent(item.percentage)}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Total: {item.total}</span>
                        <span>Lost: {item.lost}</span>
                        <span>Found: {item.found}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
