import Link from 'next/link'
import { ProposalCard } from '~/components/proposals/ProposalCard'
import { ProposalErrorState } from '~/components/proposals/ProposalErrorState'
import { formatTokenAmount } from '~/lib/governance/format'
import { getDelegateOverview } from '~/lib/governance/delegates'
import { getGovernanceOverview } from '~/lib/governance/proposals'
import { getTreasuryOverview } from '~/lib/governance/treasury'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
    const [overview, treasury, delegates] = await Promise.all([
      getGovernanceOverview(),
      getTreasuryOverview(),
      getDelegateOverview(),
    ])
    const recentProposals = overview.proposals.slice(0, 3)
    const topDelegates = delegates.delegates.slice(0, 3)
    const treasurySnapshot = treasury.assets
      .filter((asset) => asset.symbol === 'ETH' || asset.symbol === 'UP')
      .slice(0, 2)

    return (
      <section className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
              Unlock DAO
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-brand-ui-primary">
              Governance overview
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-brand-ui-primary/72">
              This read-only slice already loads recent governance activity from
              the Base governor contract, including live quorum-aware states and
              proposal vote totals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-brand-ui-primary px-5 py-3 text-sm font-semibold text-white"
                href="/proposals"
              >
                Browse proposals
              </Link>
              <Link
                className="rounded-full border border-brand-ui-primary/15 bg-white px-5 py-3 text-sm font-semibold text-brand-ui-primary"
                href="/propose"
              >
                New proposal
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <StatCard
              label="Total proposals"
              value={overview.proposals.length.toString()}
            />
            <StatCard
              label="Proposal threshold"
              value={`${formatTokenAmount(overview.proposalThreshold)} ${overview.tokenSymbol}`}
            />
            <StatCard
              label="Voting period"
              value={`${overview.votingPeriod.toString()} seconds`}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold text-brand-ui-primary">
              Delegates snapshot
            </h3>
            <Link
              className="text-sm font-semibold text-brand-ui-primary"
              href="/delegates"
            >
              View delegates
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topDelegates.map((delegate) => (
              <StatCard
                key={delegate.address}
                label={delegate.address}
                value={`${formatTokenAmount(delegate.votingPower)} UP`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold text-brand-ui-primary">
              Treasury snapshot
            </h3>
            <Link
              className="text-sm font-semibold text-brand-ui-primary"
              href="/treasury"
            >
              View treasury
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {treasurySnapshot.map((asset) => (
              <StatCard
                key={asset.symbol}
                label={asset.symbol}
                value={`${formatTokenAmount(asset.balance, asset.decimals)} ${asset.symbol}`}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold text-brand-ui-primary">
              Recent proposals
            </h3>
            <Link
              className="text-sm font-semibold text-brand-ui-primary"
              href="/proposals"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-5">
            {recentProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                now={overview.latestTimestamp}
                proposal={proposal}
                tokenSymbol={overview.tokenSymbol}
              />
            ))}
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('[home/page] governance data load failed:', error)
    return (
      <ProposalErrorState description="The DAO home page could not load governance data from the subgraph. Ensure BASE_SUBGRAPH_URL is set and the subgraph is reachable." />
    )
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-brand-ui-primary">
        {value}
      </div>
    </div>
  )
}
