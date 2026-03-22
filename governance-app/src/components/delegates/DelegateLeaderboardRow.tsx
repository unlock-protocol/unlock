// ABOUTME: Client component for a single delegate leaderboard row.
// Shows rank, address (with ENS/Basename resolution), voting power metrics,
// and a Delegate button that pre-fills the delegation form.
'use client'

import { Address, Button } from '@unlock-protocol/ui'
import { JsonRpcProvider, Network } from 'ethers'
import { useRouter } from 'next/navigation'
import { governanceConfig } from '~/config/governance'

export type DelegateRowData = {
  address: string
  rank: number
  votingPower: string
  tokenBalance: string
  delegatorCount: number
  delegatedShare: string
}

async function resolveAddressName(
  address: string
): Promise<string | undefined> {
  try {
    const baseProvider = new JsonRpcProvider(
      governanceConfig.rpcUrl,
      Network.from(8453)
    )
    const basename = await baseProvider.lookupAddress(address)
    if (basename) return basename
  } catch (_) {
    // Basename resolution failed — fall through to ENS
  }

  try {
    const mainnetProvider = new JsonRpcProvider(
      governanceConfig.mainnetRpcUrl,
      Network.from(1)
    )
    const ensName = await mainnetProvider.lookupAddress(address)
    if (ensName) return ensName
  } catch (_) {
    // ENS resolution failed — return undefined
  }

  return undefined
}

export function DelegateLeaderboardRow({
  address,
  rank,
  votingPower,
  tokenBalance,
  delegatorCount,
  delegatedShare,
}: DelegateRowData) {
  const router = useRouter()

  function handleDelegate() {
    router.push(`?delegate=${address}`, { scroll: true })
  }

  return (
    <div className="grid gap-4 rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm md:grid-cols-[60px_minmax(0,2fr)_1fr_1fr_1fr_auto] md:items-center">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
        #{rank}
      </div>
      <div>
        <div className="text-lg font-semibold text-brand-ui-primary">
          <Address address={address} useName={resolveAddressName} />
        </div>
        <div className="text-sm text-brand-ui-primary/60">
          Balance: {tokenBalance} UP
        </div>
      </div>
      <Metric label="Voting power" value={`${votingPower} UP`} />
      <Metric label="% delegated" value={delegatedShare} />
      <Metric label="Delegators" value={delegatorCount.toString()} />
      <Button size="small" variant="outlined-primary" onClick={handleDelegate}>
        Delegate
      </Button>
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
