import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalQueued,
  UPGovernor,
  VoteCast,
  VoteCastWithParams,
} from '../generated/UPGovernor/UPGovernor'
import {
  DelegateChanged,
  DelegateVotesChanged,
  Transfer,
} from '../generated/UPToken/UPToken'
import { Delegate, DelegateSummary, Proposal, Vote } from '../generated/schema'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function handleProposalCreated(event: ProposalCreated): void {
  const id = event.params.proposalId.toString()
  const proposal = new Proposal(id)
  const governor = UPGovernor.bind(event.address)
  const quorumCall = governor.try_quorum(event.params.voteStart)
  const proposalThresholdCall = governor.try_proposalThreshold()

  proposal.proposer = event.params.proposer.toHexString()
  proposal.description = event.params.description
  proposal.forVotes = BigInt.zero()
  proposal.againstVotes = BigInt.zero()
  proposal.abstainVotes = BigInt.zero()
  proposal.voteStartBlock = event.params.voteStart
  proposal.voteEndBlock = event.params.voteEnd
  proposal.createdAt = event.block.timestamp
  proposal.quorum = quorumCall.reverted ? BigInt.zero() : quorumCall.value
  proposal.proposalThreshold = proposalThresholdCall.reverted
    ? BigInt.zero()
    : proposalThresholdCall.value
  proposal.targets = addressArrayToStrings(event.params.targets)
  proposal.values = event.params.values
  proposal.calldatas = event.params.calldatas
  proposal.transactionHash = event.transaction.hash.toHexString()
  proposal.save()
}

export function handleVoteCast(event: VoteCast): void {
  createVote(
    event.params.proposalId,
    event.params.voter,
    event.params.support,
    event.params.weight,
    event.params.reason,
    event.block.timestamp,
    event.transaction.hash
  )
}

export function handleVoteCastWithParams(event: VoteCastWithParams): void {
  createVote(
    event.params.proposalId,
    event.params.voter,
    event.params.support,
    event.params.weight,
    event.params.reason,
    event.block.timestamp,
    event.transaction.hash
  )
}

export function handleProposalQueued(event: ProposalQueued): void {
  const proposal = Proposal.load(event.params.proposalId.toString())
  if (!proposal) {
    return
  }

  proposal.etaSeconds = event.params.etaSeconds
  proposal.save()
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  const proposal = Proposal.load(event.params.proposalId.toString())
  if (!proposal) {
    return
  }

  proposal.executedAt = event.block.timestamp
  proposal.save()
}

export function handleProposalCanceled(event: ProposalCanceled): void {
  const proposal = Proposal.load(event.params.proposalId.toString())
  if (!proposal) {
    return
  }

  proposal.canceledAt = event.block.timestamp
  proposal.save()
}

export function handleDelegateChanged(event: DelegateChanged): void {
  const delegate = loadOrCreateDelegate(
    event.params.delegator,
    event.block.timestamp
  )

  delegate.delegatedTo = event.params.toDelegate.toHexString()
  delegate.updatedAt = event.block.timestamp
  delegate.save()

  updateDelegatorCount(event.params.fromDelegate, -1, event.block.timestamp)
  updateDelegatorCount(event.params.toDelegate, 1, event.block.timestamp)
}

export function handleDelegateVotesChanged(event: DelegateVotesChanged): void {
  const delegate = loadOrCreateDelegate(
    event.params.delegate,
    event.block.timestamp
  )
  delegate.votingPower = event.params.newVotes
  delegate.updatedAt = event.block.timestamp
  delegate.save()

  const summary = loadOrCreateDelegateSummary(
    event.params.delegate,
    event.block.timestamp
  )
  summary.totalDelegatedPower = event.params.newVotes
  summary.updatedAt = event.block.timestamp
  summary.save()
}

export function handleUPTokenTransfer(event: Transfer): void {
  if (event.params.from.toHexString() != ZERO_ADDRESS) {
    const fromDelegate = loadOrCreateDelegate(
      event.params.from,
      event.block.timestamp
    )
    fromDelegate.tokenBalance = fromDelegate.tokenBalance.minus(
      event.params.value
    )
    fromDelegate.updatedAt = event.block.timestamp
    fromDelegate.save()
  }

  if (event.params.to.toHexString() != ZERO_ADDRESS) {
    const toDelegate = loadOrCreateDelegate(
      event.params.to,
      event.block.timestamp
    )
    toDelegate.tokenBalance = toDelegate.tokenBalance.plus(event.params.value)
    toDelegate.updatedAt = event.block.timestamp
    toDelegate.save()
  }
}

function createVote(
  proposalId: BigInt,
  voter: Address,
  support: i32,
  weight: BigInt,
  reason: string,
  createdAt: BigInt,
  transactionHash: Bytes
): void {
  const proposal = Proposal.load(proposalId.toString())
  if (!proposal) {
    return
  }

  const voterId = voter.toHexString()
  const vote = new Vote(proposalId.toString().concat('-').concat(voterId))
  vote.proposal = proposal.id
  vote.voter = voterId
  vote.support = support
  vote.weight = weight
  vote.reason = reason
  vote.createdAt = createdAt
  vote.transactionHash = transactionHash.toHexString()
  vote.save()

  if (support == 0) {
    proposal.againstVotes = proposal.againstVotes.plus(weight)
  } else if (support == 1) {
    proposal.forVotes = proposal.forVotes.plus(weight)
  } else if (support == 2) {
    proposal.abstainVotes = proposal.abstainVotes.plus(weight)
  }
  proposal.save()

  const summary = loadOrCreateDelegateSummary(voter, createdAt)
  summary.proposalsVoted = summary.proposalsVoted + 1
  summary.updatedAt = createdAt
  summary.save()
}

function loadOrCreateDelegate(address: Address, timestamp: BigInt): Delegate {
  const id = address.toHexString()
  let delegate = Delegate.load(id)

  if (!delegate) {
    delegate = new Delegate(id)
    delegate.delegatedTo = ZERO_ADDRESS
    delegate.votingPower = BigInt.zero()
    delegate.tokenBalance = BigInt.zero()
    delegate.updatedAt = timestamp
  }

  return delegate
}

function loadOrCreateDelegateSummary(
  address: Address,
  timestamp: BigInt
): DelegateSummary {
  const id = address.toHexString()
  let summary = DelegateSummary.load(id)

  if (!summary) {
    summary = new DelegateSummary(id)
    summary.totalDelegatedPower = BigInt.zero()
    summary.delegatorCount = 0
    summary.proposalsVoted = 0
    summary.updatedAt = timestamp
  }

  return summary
}

function updateDelegatorCount(
  delegateAddress: Address,
  delta: i32,
  timestamp: BigInt
): void {
  if (delegateAddress.toHexString() == ZERO_ADDRESS) {
    return
  }

  const summary = loadOrCreateDelegateSummary(delegateAddress, timestamp)
  const nextCount = summary.delegatorCount + delta
  summary.delegatorCount = nextCount < 0 ? 0 : nextCount
  summary.updatedAt = timestamp
  summary.save()
}

function addressArrayToStrings(addresses: Array<Address>): Array<string> {
  const values = new Array<string>(addresses.length)

  for (let i = 0; i < addresses.length; i++) {
    values[i] = addresses[i].toHexString()
  }

  return values
}
