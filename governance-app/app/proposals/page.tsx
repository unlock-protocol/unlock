import { ProposalCard } from '~/components/proposals/ProposalCard'
import { ProposalErrorState } from '~/components/proposals/ProposalErrorState'
import { ProposalFilters } from '~/components/proposals/ProposalFilters'
import {
  filterProposals,
  getGovernanceOverview,
} from '~/lib/governance/proposals'

export const dynamic = 'force-dynamic'

type ProposalsPageProps = {
  searchParams?: {
    state?: string
  }
}

export default async function ProposalsPage({
  searchParams,
}: ProposalsPageProps) {
  const activeFilter = searchParams?.state || 'All'

  try {
    const overview = await getGovernanceOverview()
    const proposals = filterProposals(overview.proposals, searchParams?.state)

    return (
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
            Proposal Read Paths
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-semibold text-brand-ui-primary">
                Proposals
              </h2>
              <p className="max-w-3xl text-base leading-7 text-brand-ui-primary/70">
                Live proposal history sourced from Base governor events with
                quorum-aware state derivation on the server.
              </p>
            </div>
            <div className="rounded-3xl bg-white px-5 py-4 text-sm text-brand-ui-primary/70 shadow-sm">
              {overview.proposals.length} proposals
            </div>
          </div>
        </div>
        <ProposalFilters activeFilter={activeFilter} />
        <div className="grid gap-5">
          {proposals.length ? (
            proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                now={overview.latestTimestamp}
                proposal={proposal}
                tokenSymbol={overview.tokenSymbol}
              />
            ))
          ) : (
            <ProposalErrorState
              title="No proposals match this filter"
              description={`There are currently no proposals in the ${activeFilter} state.`}
            />
          )}
        </div>
      </section>
    )
  } catch (error) {
    console.error('[proposals/page] getGovernanceOverview failed:', error)
    return (
      <ProposalErrorState description="The proposals page could not load governance data from the subgraph. Ensure BASE_SUBGRAPH_URL is set and the subgraph is reachable." />
    )
  }
}
