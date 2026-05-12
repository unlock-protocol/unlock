import type { ProposalRecord, ProposalState } from './types'

export function deriveProposalState(
  proposal: Pick<
    ProposalRecord,
    | 'abstainVotes'
    | 'againstVotes'
    | 'canceledAt'
    | 'etaSeconds'
    | 'executedAt'
    | 'forVotes'
    | 'quorum'
    | 'voteEndTimestamp'
    | 'voteStartTimestamp'
  >,
  now: bigint
): ProposalState {
  if (proposal.canceledAt) {
    return 'Canceled'
  }

  if (proposal.executedAt) {
    return 'Executed'
  }

  if (proposal.etaSeconds) {
    return 'Queued'
  }

  if (now < proposal.voteStartTimestamp) {
    return 'Pending'
  }

  if (now <= proposal.voteEndTimestamp) {
    return 'Active'
  }

  const quorumReached =
    proposal.forVotes + proposal.abstainVotes >= proposal.quorum
  const voteSucceeded = proposal.forVotes > proposal.againstVotes

  return quorumReached && voteSucceeded ? 'Succeeded' : 'Defeated'
}

export function isExecutable(proposal: ProposalRecord, now: bigint) {
  return (
    proposal.state === 'Queued' &&
    !!proposal.etaSeconds &&
    now >= proposal.etaSeconds
  )
}
