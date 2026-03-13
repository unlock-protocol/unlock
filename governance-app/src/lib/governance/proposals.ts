import { cache } from 'react'
import { Interface, type InterfaceAbi, keccak256, toUtf8Bytes } from 'ethers'
import { governanceConfig } from '~/config/governance'
import { deriveProposalState } from './state'
import {
  getBlockTimestamp,
  getGovernorContract,
  getLatestTimestamp,
} from './rpc'
import type {
  DecodedCalldata,
  GovernanceOverview,
  ProposalRecord,
} from './types'

type GovernorEvent = {
  args?: Record<string, unknown> & unknown[]
  blockNumber: number
  transactionHash: string
}

function normalizeNullableTimestamp(value: bigint) {
  return value > 0n ? value : null
}

function getTitle(description: string) {
  return description.split('\n')[0]?.trim() || 'Untitled proposal'
}

function getEventArg<T>(event: GovernorEvent, key: string) {
  return event.args?.[key] as T
}

async function getLifecycleMaps() {
  const governor = getGovernorContract()
  const [queuedEvents, canceledEvents, executedEvents] = await Promise.all([
    governor.queryFilter('ProposalQueued', governanceConfig.governorStartBlock),
    governor.queryFilter(
      'ProposalCanceled',
      governanceConfig.governorStartBlock
    ),
    governor.queryFilter(
      'ProposalExecuted',
      governanceConfig.governorStartBlock
    ),
  ])

  const queuedByProposalId = new Map<string, bigint>()
  const canceledByProposalId = new Map<string, bigint>()
  const executedByProposalId = new Map<string, bigint>()

  await Promise.all(
    queuedEvents.map(async (event: GovernorEvent) => {
      const proposalId = getEventArg<bigint>(event, 'proposalId').toString()
      queuedByProposalId.set(
        proposalId,
        getEventArg<bigint>(event, 'etaSeconds')
      )
    })
  )

  await Promise.all(
    canceledEvents.map(async (event: GovernorEvent) => {
      const proposalId = getEventArg<bigint>(event, 'proposalId').toString()
      canceledByProposalId.set(
        proposalId,
        await getBlockTimestamp(event.blockNumber)
      )
    })
  )

  await Promise.all(
    executedEvents.map(async (event: GovernorEvent) => {
      const proposalId = getEventArg<bigint>(event, 'proposalId').toString()
      executedByProposalId.set(
        proposalId,
        await getBlockTimestamp(event.blockNumber)
      )
    })
  )

  return {
    canceledByProposalId,
    executedByProposalId,
    queuedByProposalId,
  }
}

export const getGovernanceOverview = cache(
  async (): Promise<GovernanceOverview> => {
    const governor = getGovernorContract()
    const [
      proposalCreatedEvents,
      latestTimestamp,
      proposalThreshold,
      votingDelay,
      votingPeriod,
      lifecycleMaps,
    ] = await Promise.all([
      governor.queryFilter(
        'ProposalCreated',
        governanceConfig.governorStartBlock
      ),
      getLatestTimestamp(),
      governor.proposalThreshold() as Promise<bigint>,
      governor.votingDelay() as Promise<bigint>,
      governor.votingPeriod() as Promise<bigint>,
      getLifecycleMaps(),
    ])

    const proposals = await Promise.all(
      proposalCreatedEvents.map(async (event: GovernorEvent) => {
        const proposalId = getEventArg<bigint>(event, 'proposalId')
        const voteStartTimestamp = getEventArg<bigint>(event, 'voteStart')
        const voteEndTimestamp = getEventArg<bigint>(event, 'voteEnd')
        const description = getEventArg<string>(event, 'description')
        const [voteTotals, quorum, createdAtTimestamp, etaSecondsFromContract] =
          await Promise.all([
            governor.proposalVotes(proposalId) as Promise<
              [bigint, bigint, bigint] & {
                abstainVotes: bigint
                againstVotes: bigint
                forVotes: bigint
              }
            >,
            governor.quorum(voteStartTimestamp) as Promise<bigint>,
            getBlockTimestamp(event.blockNumber),
            governor.proposalEta(proposalId) as Promise<bigint>,
          ])

        const id = proposalId.toString()
        const etaSeconds =
          lifecycleMaps.queuedByProposalId.get(id) ||
          normalizeNullableTimestamp(etaSecondsFromContract)
        const proposal: ProposalRecord = {
          abstainVotes: voteTotals.abstainVotes,
          againstVotes: voteTotals.againstVotes,
          calldatas: getEventArg<string[]>(event, 'calldatas'),
          canceledAt: lifecycleMaps.canceledByProposalId.get(id) || null,
          createdAtTimestamp,
          description,
          descriptionHash: keccak256(toUtf8Bytes(description)),
          etaSeconds: etaSeconds || null,
          executedAt: lifecycleMaps.executedByProposalId.get(id) || null,
          forVotes: voteTotals.forVotes,
          id,
          proposalThreshold,
          proposer: getEventArg<string>(event, 'proposer'),
          quorum,
          state: 'Pending',
          targets: getEventArg<string[]>(event, 'targets'),
          title: getTitle(description),
          transactionHash: event.transactionHash,
          values: getEventArg<bigint[]>(event, 'values'),
          voteEndTimestamp,
          voteStartTimestamp,
        }

        return {
          ...proposal,
          state: deriveProposalState(proposal, latestTimestamp),
        }
      })
    )

    proposals.sort((left, right) =>
      Number(right.createdAtTimestamp - left.createdAtTimestamp)
    )

    return {
      latestTimestamp,
      proposalThreshold,
      proposals,
      votingDelay,
      votingPeriod,
    }
  }
)

export async function getProposalById(proposalId: string) {
  const overview = await getGovernanceOverview()

  return (
    overview.proposals.find((proposal) => proposal.id === proposalId) || null
  )
}

export function filterProposals(
  proposals: ProposalRecord[],
  state: string | undefined
) {
  if (!state || state === 'All') {
    return proposals
  }

  return proposals.filter((proposal) => proposal.state === state)
}

export function decodeProposalCalldatas(
  proposal: ProposalRecord
): DecodedCalldata[] {
  const candidates = governanceConfig.knownContracts.map((contract) => ({
    interface: new Interface(getContractAbi(contract.abi)),
    label: contract.label,
  }))

  return proposal.calldatas.map((calldata, index) => {
    const target = proposal.targets[index]
    const value = proposal.values[index] || 0n

    for (const candidate of candidates) {
      try {
        const parsed = candidate.interface.parseTransaction({
          data: calldata,
          value,
        })

        if (!parsed) {
          continue
        }

        return {
          args: parsed.args.map((arg) => stringifyArgument(arg)),
          contractLabel: candidate.label,
          functionName: parsed.name,
          kind: 'decoded' as const,
          value,
        }
      } catch {
        continue
      }
    }

    return {
      calldata,
      kind: 'raw' as const,
      target,
      value,
    }
  })
}

function stringifyArgument(value: unknown): string {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stringifyArgument(item)).join(', ')}]`
  }

  return String(value)
}

function getContractAbi(abi: unknown): InterfaceAbi {
  if (abi && typeof abi === 'object' && 'abi' in abi) {
    return (abi as { abi: InterfaceAbi }).abi
  }

  return abi as InterfaceAbi
}
