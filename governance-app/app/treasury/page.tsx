import { base } from '@unlock-protocol/networks'
import { ProposalErrorState } from '~/components/proposals/ProposalErrorState'
import { TreasuryAssetCard } from '~/components/treasury/TreasuryAssetCard'
import { truncateAddress } from '~/lib/governance/format'
import { getTreasuryOverview } from '~/lib/governance/treasury'

export const dynamic = 'force-dynamic'

export default async function TreasuryPage() {
  try {
    const treasury = await getTreasuryOverview()
    const timelockExplorerUrl =
      base.explorer?.urls.address(treasury.timelockAddress) || '#'

    return (
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
            Treasury Read Path
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-semibold text-brand-ui-primary">
                Timelock treasury
              </h2>
              <p className="max-w-3xl text-base leading-7 text-brand-ui-primary/72">
                Live balances held by the Unlock DAO timelock, fetched directly
                from Base on each page load. This is a curated known-token view,
                not an exhaustive inventory of arbitrary ERC20 transfers.
              </p>
            </div>
            <a
              className="rounded-full border border-brand-ui-primary/10 px-5 py-3 text-sm font-semibold text-brand-ui-primary"
              href={timelockExplorerUrl}
              rel="noreferrer"
              target="_blank"
            >
              View {truncateAddress(treasury.timelockAddress, 6)} on Basescan
            </a>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {treasury.assets.map((asset) => (
            <TreasuryAssetCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      </section>
    )
  } catch (error) {
    return (
      <ProposalErrorState description="The treasury page could not load timelock balances from Base. Check RPC connectivity or try again shortly." />
    )
  }
}
