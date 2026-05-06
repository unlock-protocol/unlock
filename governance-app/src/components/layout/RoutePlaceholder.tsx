import { governanceConfig } from '~/config/governance'

type RoutePlaceholderProps = {
  title: string
  description: string
}

export function RoutePlaceholder({
  title,
  description,
}: RoutePlaceholderProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_320px]">
      <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
            First Implementation Slice
          </p>
          <h2 className="text-3xl font-semibold text-brand-ui-primary">
            {title}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-brand-ui-primary/70">
            {description}
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-ui-secondary-200 p-5">
            <h3 className="text-sm font-semibold text-brand-ui-primary">
              Ready in this slice
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-ui-primary/70">
              <li>Workspace wiring and Next.js app shell</li>
              <li>Shared providers and route structure</li>
              <li>Base DAO config and known-contract registry</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-ui-secondary-200 p-5">
            <h3 className="text-sm font-semibold text-brand-ui-primary">
              Next slice
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-ui-primary/70">
              <li>Proposal reads and RPC fallback behavior</li>
              <li>State derivation and quorum-aware UI</li>
              <li>Actual list/detail data fetching</li>
            </ul>
          </div>
        </div>
      </div>
      <aside className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/60">
          Known Contracts
        </h3>
        <ul className="mt-4 space-y-3 text-sm text-brand-ui-primary/75">
          {governanceConfig.knownContracts.map((contract) => (
            <li
              key={contract.label}
              className="rounded-2xl border border-brand-ui-primary/10 bg-ui-secondary-200 px-4 py-3"
            >
              <div className="font-medium text-brand-ui-primary">
                {contract.label}
              </div>
              <div className="text-brand-ui-primary/60">{contract.kind}</div>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}
