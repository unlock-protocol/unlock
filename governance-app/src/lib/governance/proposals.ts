// ABOUTME: Governance proposal data access layer. Fetches proposals via subgraph,
// ABOUTME: derives on-chain state using current timestamp from RPC.
import { cache } from 'react'
import { Interface, type InterfaceAbi } from 'ethers'
import { governanceConfig } from '~/config/governance'
import { deriveProposalState } from './state'
import { getGovernorContract, getLatestTimestamp, getTokenSymbol } from './rpc'
import { getProposalsFromSubgraph } from './subgraph'
import type {
  DecodedCalldata,
  GovernanceOverview,
  ProposalRecord,
} from './types'

export const getGovernanceOverview = cache(
  async (): Promise<GovernanceOverview> => {
    const governor = getGovernorContract()
    const [
      latestTimestamp,
      proposalThreshold,
      votingDelay,
      votingPeriod,
      tokenSymbol,
    ] = await Promise.all([
      getLatestTimestamp(),
      governor.proposalThreshold() as Promise<bigint>,
      governor.votingDelay() as Promise<bigint>,
      governor.votingPeriod() as Promise<bigint>,
      getTokenSymbol(),
    ])

    const rawProposals = await getProposalsFromSubgraph(proposalThreshold)

    const proposals: ProposalRecord[] = rawProposals.map((proposal) => ({
      ...proposal,
      state: deriveProposalState(proposal, latestTimestamp),
    }))

    return {
      latestTimestamp,
      proposalThreshold,
      proposals,
      tokenSymbol,
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
