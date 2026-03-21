// ABOUTME: Delegates page — personal delegation form (wallet-connected) and
// the full delegate leaderboard ordered by voting power.
import { ProposalErrorState } from '~/components/proposals/ProposalErrorState'
import { DelegateLeaderboardRow } from '~/components/delegates/DelegateLeaderboardRow'
import { DelegateFormSection } from '~/components/delegates/DelegateFormSection'
import { getDelegateOverview } from '~/lib/governance/delegates'

export const dynamic = 'force-dynamic'

export default async function DelegatesPage() {
  try {
    const overview = await getDelegateOverview()

    return (
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
            Personal Delegation
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-brand-ui-primary">
            Manage your Unlock DAO voting power
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-brand-ui-primary/72">
            Review your current UP balance and voting power, and delegate to
            yourself or another address. Connect your wallet to get started.
          </p>
        </div>

        <DelegateFormSection />

        <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
            Delegate Leaderboard
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-brand-ui-primary">
            Top delegates by voting power
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-brand-ui-primary/72">
            Current delegation relationships reconstructed from on-chain
            DelegateChanged events and hydrated with live voting power from the
            UP token contract.
          </p>
        </div>
        <div className="grid gap-4">
          {overview.delegates.map((delegate, index) => (
            <DelegateLeaderboardRow
              key={delegate.address}
              delegate={delegate}
              rank={index + 1}
              totalSupply={overview.totalSupply}
            />
          ))}
        </div>
      </section>
    )
  } catch (error) {
    return (
      <ProposalErrorState description="The delegates page could not load delegation data from Base. Check RPC connectivity or try again shortly." />
    )
  }
}
