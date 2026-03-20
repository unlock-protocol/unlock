import { formatTokenAmount, truncateAddress } from '~/lib/governance/format'
import {
  formatDelegatedShare,
  type DelegateRecord,
} from '~/lib/governance/delegates'

type DelegateLeaderboardRowProps = {
  delegate: DelegateRecord
  rank: number
  totalSupply: bigint
}

export function DelegateLeaderboardRow({
  delegate,
  rank,
  totalSupply,
}: DelegateLeaderboardRowProps) {
  return (
    <div className="grid gap-4 rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm md:grid-cols-[80px_minmax(0,2fr)_1fr_1fr_1fr] md:items-center">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        #{rank}
      </div>
      <div>
        <div className="text-lg font-semibold text-brand-ui-primary">
          {truncateAddress(delegate.address, 6)}
        </div>
        <div className="text-sm text-brand-ui-primary/60">
          Token balance: {formatTokenAmount(delegate.tokenBalance)} UP
        </div>
      </div>
      <Metric
        label="Voting power"
        value={`${formatTokenAmount(delegate.votingPower)} UP`}
      />
      <Metric
        label="% delegated"
        value={formatDelegatedShare(delegate.votingPower, totalSupply)}
      />
      <Metric label="Delegators" value={delegate.delegatorCount.toString()} />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-brand-ui-primary">
        {value}
      </div>
    </div>
  )
}
