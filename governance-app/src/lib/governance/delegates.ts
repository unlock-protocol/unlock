import { cache } from 'react'
import { formatEther, getAddress } from 'ethers'
import { getTokenContract } from './rpc'

const zeroAddress = '0x0000000000000000000000000000000000000000'

type DelegateEvent = {
  args?: Record<string, unknown> & unknown[]
}

export type DelegateRecord = {
  address: string
  delegatorCount: number
  tokenBalance: bigint
  votingPower: bigint
}

export type DelegateOverview = {
  delegates: DelegateRecord[]
  totalSupply: bigint
}

function getEventArg<T>(event: DelegateEvent, key: string) {
  return event.args?.[key] as T
}

export const getDelegateOverview = cache(
  async (): Promise<DelegateOverview> => {
    const token = getTokenContract()
    const delegateChangedEvents = await token.queryFilter('DelegateChanged')
    const currentDelegates = new Map<string, string>()

    for (const event of delegateChangedEvents as DelegateEvent[]) {
      const delegator = getAddress(getEventArg<string>(event, 'delegator'))
      const delegate = getAddress(getEventArg<string>(event, 'toDelegate'))
      currentDelegates.set(delegator, delegate)
    }

    const delegateToDelegators = new Map<string, Set<string>>()

    for (const [delegator, delegate] of currentDelegates.entries()) {
      if (delegate === zeroAddress) {
        continue
      }

      const delegators = delegateToDelegators.get(delegate) || new Set<string>()
      delegators.add(delegator)
      delegateToDelegators.set(delegate, delegators)
    }

    const [totalSupply, delegates] = await Promise.all([
      token.totalSupply() as Promise<bigint>,
      Promise.all(
        Array.from(delegateToDelegators.entries()).map(
          async ([address, delegators]) => {
            const [votingPower, tokenBalance] = await Promise.all([
              token.getVotes(address) as Promise<bigint>,
              token.balanceOf(address) as Promise<bigint>,
            ])

            return {
              address,
              delegatorCount: delegators.size,
              tokenBalance,
              votingPower,
            } satisfies DelegateRecord
          }
        )
      ),
    ])

    delegates.sort((left, right) => {
      const votingPowerDelta = Number(right.votingPower - left.votingPower)

      if (votingPowerDelta !== 0) {
        return votingPowerDelta
      }

      return right.delegatorCount - left.delegatorCount
    })

    return {
      delegates: delegates.filter(
        (delegate) => delegate.votingPower > 0n || delegate.delegatorCount > 0
      ),
      totalSupply,
    }
  }
)

export function formatDelegatedShare(votingPower: bigint, totalSupply: bigint) {
  if (totalSupply === 0n) {
    return '0.0%'
  }

  return `${((Number(formatEther(votingPower)) / Number(formatEther(totalSupply))) * 100).toFixed(1)}%`
}
