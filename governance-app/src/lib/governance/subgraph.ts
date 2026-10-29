// ABOUTME: GraphQL client for fetching governance proposals from The Graph subgraph.
// ABOUTME: Replaces direct RPC eth_getLogs queries which are too large for most providers.
import { cache } from 'react'
import { keccak256, toUtf8Bytes } from 'ethers'
import { governanceConfig } from '~/config/governance'
import type { ProposalRecord } from './types'

const PROPOSALS_QUERY = `
  query GetProposals {
    proposals(first: 1000, orderBy: createdAt, orderDirection: desc) {
      id
      proposer
      description
      forVotes
      againstVotes
      abstainVotes
      voteStartBlock
      voteEndBlock
      createdAt
      quorum
      proposalThreshold
      targets
      values
      calldatas
      etaSeconds
      executedAt
      canceledAt
      transactionHash
    }
  }
`

type SubgraphProposal = {
  id: string
  proposer: string
  description: string
  forVotes: string
  againstVotes: string
  abstainVotes: string
  voteStartBlock: string
  voteEndBlock: string
  createdAt: string
  quorum: string
  proposalThreshold: string
  targets: string[]
  values: string[]
  calldatas: string[]
  etaSeconds: string | null
  executedAt: string | null
  canceledAt: string | null
  transactionHash: string
}

async function fetchSubgraph<T>(query: string): Promise<T> {
  const response = await fetch(governanceConfig.subgraphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Subgraph request failed: ${response.status}`)
  }

  const json = await response.json()

  if (json.errors?.length) {
    throw new Error(`Subgraph error: ${json.errors[0].message}`)
  }

  return json.data as T
}

function getTitle(description: string) {
  const firstLine = description.split('\n')[0]?.trim() || 'Untitled proposal'
  // Strip leading markdown heading markers (e.g. "## Title" → "Title")
  return firstLine.replace(/^#+\s*/, '') || 'Untitled proposal'
}

export const getProposalsFromSubgraph = cache(
  async (
    proposalThreshold: bigint
  ): Promise<Omit<ProposalRecord, 'state'>[]> => {
    const data = await fetchSubgraph<{ proposals: SubgraphProposal[] }>(
      PROPOSALS_QUERY
    )

    return data.proposals.map((p) => ({
      id: p.id,
      proposer: p.proposer,
      description: p.description,
      title: getTitle(p.description),
      descriptionHash: keccak256(toUtf8Bytes(p.description)),
      forVotes: BigInt(p.forVotes),
      againstVotes: BigInt(p.againstVotes),
      abstainVotes: BigInt(p.abstainVotes),
      voteStartTimestamp: BigInt(p.voteStartBlock),
      voteEndTimestamp: BigInt(p.voteEndBlock),
      createdAtTimestamp: BigInt(p.createdAt),
      quorum: BigInt(p.quorum),
      proposalThreshold,
      targets: p.targets,
      values: p.values.map((v) => BigInt(v)),
      calldatas: p.calldatas,
      etaSeconds: p.etaSeconds ? BigInt(p.etaSeconds) : null,
      executedAt: p.executedAt ? BigInt(p.executedAt) : null,
      canceledAt: p.canceledAt ? BigInt(p.canceledAt) : null,
      transactionHash: p.transactionHash,
    }))
  }
)
