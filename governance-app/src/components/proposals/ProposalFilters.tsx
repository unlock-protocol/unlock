import Link from 'next/link'

const proposalFilters = [
  'All',
  'Active',
  'Pending',
  'Succeeded',
  'Queued',
  'Defeated',
  'Executed',
  'Canceled',
] as const

type ProposalFiltersProps = {
  activeFilter: string
}

export function ProposalFilters({ activeFilter }: ProposalFiltersProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      {proposalFilters.map((filter) => {
        const isActive = filter === activeFilter

        return (
          <Link
            key={filter}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'border-brand-ui-primary bg-brand-ui-primary text-white'
                : 'border-brand-ui-primary/10 bg-white text-brand-ui-primary hover:border-brand-ui-primary/25'
            }`}
            href={
              filter === 'All' ? '/proposals' : `/proposals?state=${filter}`
            }
          >
            {filter}
          </Link>
        )
      })}
    </nav>
  )
}
