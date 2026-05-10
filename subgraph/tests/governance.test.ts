import {
  beforeEach,
  assert,
  clearStore,
  describe,
  test,
} from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  handleDelegateChanged,
  handleDelegateVotesChanged,
  handleProposalCanceled,
  handleProposalCreated,
  handleProposalExecuted,
  handleProposalQueued,
  handleUPTokenTransfer,
  handleVoteCast,
  handleVoteCastWithParams,
} from '../src/governance'
import {
  createDelegateChangedEvent,
  createDelegateVotesChangedEvent,
  createProposalCanceledEvent,
  createProposalCreatedEvent,
  createProposalExecutedEvent,
  createProposalQueuedEvent,
  createTransferEvent,
  createVoteCastEvent,
  createVoteCastWithParamsEvent,
  delegateAddress,
  delegatorAddress,
  mockGovernorCalls,
  proposalId,
  proposerAddress,
  secondDelegateAddress,
  secondVoterAddress,
  voterAddress,
} from './governance-utils'
import { nullAddress } from './constants'

const quorum = BigInt.fromString('3000000')
const proposalThreshold = BigInt.fromString('100000')
const etaSeconds = BigInt.fromI32(400)
const voteStart = BigInt.fromI32(200)
const voteEnd = BigInt.fromI32(300)

describe('governance mappings', () => {
  beforeEach(() => {
    clearStore()
    mockGovernorCalls(voteStart, quorum, proposalThreshold)
  })

  test('ProposalCreated creates a proposal with indexed governor metadata', () => {
    handleProposalCreated(
      createProposalCreatedEvent(
        proposalId,
        voteStart,
        voteEnd,
        'Upgrade protocol\n\nShip the upgrade.'
      )
    )

    assert.entityCount('Proposal', 1)
    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'proposer',
      Address.fromString(proposerAddress).toHexString()
    )
    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'description',
      'Upgrade protocol\n\nShip the upgrade.'
    )
    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'quorum',
      quorum.toString()
    )
    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'proposalThreshold',
      proposalThreshold.toString()
    )
    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'transactionHash',
      '0x1000000000000000000000000000000000000000000000000000000000000001'
    )
  })

  test('VoteCast and VoteCastWithParams update proposal tallies and participation', () => {
    handleProposalCreated(
      createProposalCreatedEvent(
        proposalId,
        voteStart,
        voteEnd,
        'Upgrade protocol\n\nShip the upgrade.'
      )
    )

    handleVoteCast(createVoteCastEvent(proposalId, 1, BigInt.fromI32(42)))
    handleVoteCastWithParams(
      createVoteCastWithParamsEvent(
        proposalId,
        2,
        BigInt.fromI32(8),
        secondVoterAddress
      )
    )

    assert.entityCount('Vote', 2)
    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'forVotes',
      BigInt.fromI32(42).toString()
    )
    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'abstainVotes',
      BigInt.fromI32(8).toString()
    )
    assert.fieldEquals('DelegateSummary', voterAddress, 'proposalsVoted', '1')
    assert.fieldEquals(
      'DelegateSummary',
      secondVoterAddress,
      'proposalsVoted',
      '1'
    )
  })

  test('delegation handlers update delegate profile, balances, and leaderboard summary', () => {
    handleDelegateChanged(
      createDelegateChangedEvent(delegatorAddress, nullAddress, delegateAddress)
    )
    handleDelegateVotesChanged(
      createDelegateVotesChangedEvent(
        delegateAddress,
        BigInt.zero(),
        BigInt.fromI32(500)
      )
    )
    handleUPTokenTransfer(
      createTransferEvent(nullAddress, delegatorAddress, BigInt.fromI32(25))
    )
    handleDelegateChanged(
      createDelegateChangedEvent(
        delegatorAddress,
        delegateAddress,
        secondDelegateAddress
      )
    )

    assert.fieldEquals(
      'Delegate',
      delegatorAddress,
      'delegatedTo',
      secondDelegateAddress
    )
    assert.fieldEquals('Delegate', delegatorAddress, 'tokenBalance', '25')
    assert.fieldEquals(
      'DelegateSummary',
      delegateAddress,
      'totalDelegatedPower',
      BigInt.fromI32(500).toString()
    )
    assert.fieldEquals(
      'DelegateSummary',
      delegateAddress,
      'delegatorCount',
      '0'
    )
    assert.fieldEquals(
      'DelegateSummary',
      secondDelegateAddress,
      'delegatorCount',
      '1'
    )
  })

  test('proposal lifecycle handlers persist queued, executed, and canceled timestamps', () => {
    handleProposalCreated(
      createProposalCreatedEvent(
        proposalId,
        voteStart,
        voteEnd,
        'Upgrade protocol\n\nShip the upgrade.'
      )
    )

    handleProposalQueued(createProposalQueuedEvent(proposalId, etaSeconds))
    handleProposalExecuted(createProposalExecutedEvent(proposalId))
    handleProposalCanceled(createProposalCanceledEvent(proposalId))

    assert.fieldEquals(
      'Proposal',
      proposalId.toString(),
      'etaSeconds',
      etaSeconds.toString()
    )
    assert.fieldEquals('Proposal', proposalId.toString(), 'executedAt', '170')
    assert.fieldEquals('Proposal', proposalId.toString(), 'canceledAt', '180')
  })
})
