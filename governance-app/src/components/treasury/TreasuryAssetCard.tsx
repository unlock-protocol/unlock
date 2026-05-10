import { base } from '@unlock-protocol/networks'
import { formatTokenAmount, truncateAddress } from '~/lib/governance/format'
import type { TreasuryAsset } from '~/lib/governance/treasury'

type TreasuryAssetCardProps = {
  asset: TreasuryAsset
}

export function TreasuryAssetCard({ asset }: TreasuryAssetCardProps) {
  const explorerHref = asset.isNative
    ? base.explorer?.urls.address(asset.address)
    : base.explorer?.urls.token(asset.address, asset.address) || '#'

  return (
    <article className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
            {asset.isNative ? 'Native asset' : 'ERC20 token'}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-brand-ui-primary">
            {asset.symbol}
          </h3>
          <p className="text-sm text-brand-ui-primary/65">{asset.name}</p>
        </div>
        <a
          className="rounded-full border border-brand-ui-primary/10 px-4 py-2 text-sm font-semibold text-brand-ui-primary"
          href={explorerHref}
          rel="noreferrer"
          target="_blank"
        >
          Explorer
        </a>
      </div>
      <div className="mt-6 text-3xl font-semibold text-brand-ui-primary">
        {formatTokenAmount(asset.balance, asset.decimals)} {asset.symbol}
      </div>
      <div className="mt-2 text-sm text-brand-ui-primary/60">
        {truncateAddress(asset.address, 6)}
      </div>
    </article>
  )
}
