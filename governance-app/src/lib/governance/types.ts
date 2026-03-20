export type ProposalState =
  | 'Pending'
  | 'Active'
  | 'Succeeded'
  | 'Defeated'
  | 'Queued'
  | 'Executed'
  | 'Canceled'

export type DecodedCalldata =
  | {
      kind: 'decoded'
      contractLabel: string
      functionName: string
      args: string[]
      value: bigint
    }
  | {
      kind: 'raw'
      target: string
      calldata: string
      value: bigint
    }

export type ProposalRecord = {
  abstainVotes: bigint
  againstVotes: bigint
  calldatas: string[]
  canceledAt: bigint | null
  createdAtTimestamp: bigint
  description: string
  descriptionHash: string
  executedAt: bigint | null
  forVotes: bigint
  id: string
  proposalThreshold: bigint
  proposer: string
  quorum: bigint
  state: ProposalState
  targets: string[]
  title: string
  transactionHash: string
  values: bigint[]
  voteEndTimestamp: bigint
  voteStartTimestamp: bigint
  etaSeconds: bigint | null
}

export type GovernanceOverview = {
  latestTimestamp: bigint
  proposalThreshold: bigint
  proposals: ProposalRecord[]
  tokenSymbol: string
  votingDelay: bigint
  votingPeriod: bigint
}
