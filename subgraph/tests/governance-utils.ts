import { newMockEvent } from 'matchstick-as'
import { createMockedFunction } from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  DelegateChanged,
  DelegateVotesChanged,
  Transfer,
} from '../generated/UPToken/UPToken'
import {
  ProposalCanceled,
  ProposalCreated,
  ProposalExecuted,
  ProposalQueued,
  VoteCast,
  VoteCastWithParams,
} from '../generated/UPGovernor/UPGovernor'

export const governorAddress = '0x00000000000000000000000000000000000000a1'
export const upTokenAddress = '0x00000000000000000000000000000000000000a2'
export const proposalId = BigInt.fromI32(1)
export const proposerAddress = '0x00000000000000000000000000000000000000b1'
export const voterAddress = '0x00000000000000000000000000000000000000b2'
export const secondVoterAddress = '0x00000000000000000000000000000000000000b6'
export const delegatorAddress = '0x00000000000000000000000000000000000000b3'
export const delegateAddress = '0x00000000000000000000000000000000000000b4'
export const secondDelegateAddress =
  '0x00000000000000000000000000000000000000b5'
export const targetAddress = '0x00000000000000000000000000000000000000c1'

export function mockGovernorCalls(
  voteStart: BigInt,
  quorum: BigInt,
  proposalThreshold: BigInt
): void {
  createMockedFunction(
    Address.fromString(governorAddress),
    'quorum',
    'quorum(uint256):(uint256)'
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(voteStart)])
    .returns([ethereum.Value.fromUnsignedBigInt(quorum)])

  createMockedFunction(
    Address.fromString(governorAddress),
    'proposalThreshold',
    'proposalThreshold():(uint256)'
  )
    .withArgs([])
    .returns([ethereum.Value.fromUnsignedBigInt(proposalThreshold)])
}

export function createProposalCreatedEvent(
  proposalId: BigInt,
  voteStart: BigInt,
  voteEnd: BigInt,
  description: string
): ProposalCreated {
  const event = changetype<ProposalCreated>(newMockEvent())

  event.address = Address.fromString(governorAddress)
  event.block.timestamp = BigInt.fromI32(100)
  event.transaction.hash = Bytes.fromHexString(
    '0x1000000000000000000000000000000000000000000000000000000000000001'
  )
  event.parameters = [
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromUnsignedBigInt(proposalId)
    ),
    new ethereum.EventParam(
      'proposer',
      ethereum.Value.fromAddress(Address.fromString(proposerAddress))
    ),
    new ethereum.EventParam(
      'targets',
      ethereum.Value.fromAddressArray([Address.fromString(targetAddress)])
    ),
    new ethereum.EventParam(
      'values',
      ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI32(0)])
    ),
    new ethereum.EventParam(
      'signatures',
      ethereum.Value.fromStringArray(['transfer(address,uint256)'])
    ),
    new ethereum.EventParam(
      'calldatas',
      ethereum.Value.fromBytesArray([
        Bytes.fromHexString(
          '0xa9059cbb0000000000000000000000000000000000000000'
        ),
      ])
    ),
    new ethereum.EventParam(
      'voteStart',
      ethereum.Value.fromUnsignedBigInt(voteStart)
    ),
    new ethereum.EventParam(
      'voteEnd',
      ethereum.Value.fromUnsignedBigInt(voteEnd)
    ),
    new ethereum.EventParam(
      'description',
      ethereum.Value.fromString(description)
    ),
  ]

  return event
}

export function createVoteCastEvent(
  proposalId: BigInt,
  support: i32,
  weight: BigInt,
  voter: string = voterAddress
): VoteCast {
  const event = changetype<VoteCast>(newMockEvent())

  event.address = Address.fromString(governorAddress)
  event.block.timestamp = BigInt.fromI32(110)
  event.transaction.hash = Bytes.fromHexString(
    '0x2000000000000000000000000000000000000000000000000000000000000002'
  )
  event.parameters = [
    new ethereum.EventParam(
      'voter',
      ethereum.Value.fromAddress(Address.fromString(voter))
    ),
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromUnsignedBigInt(proposalId)
    ),
    new ethereum.EventParam(
      'support',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(support))
    ),
    new ethereum.EventParam(
      'weight',
      ethereum.Value.fromUnsignedBigInt(weight)
    ),
    new ethereum.EventParam('reason', ethereum.Value.fromString('ship it')),
  ]

  return event
}

export function createVoteCastWithParamsEvent(
  proposalId: BigInt,
  support: i32,
  weight: BigInt,
  voter: string = voterAddress
): VoteCastWithParams {
  const event = changetype<VoteCastWithParams>(newMockEvent())

  event.address = Address.fromString(governorAddress)
  event.block.timestamp = BigInt.fromI32(120)
  event.transaction.hash = Bytes.fromHexString(
    '0x3000000000000000000000000000000000000000000000000000000000000003'
  )
  event.parameters = [
    new ethereum.EventParam(
      'voter',
      ethereum.Value.fromAddress(Address.fromString(voter))
    ),
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromUnsignedBigInt(proposalId)
    ),
    new ethereum.EventParam(
      'support',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(support))
    ),
    new ethereum.EventParam(
      'weight',
      ethereum.Value.fromUnsignedBigInt(weight)
    ),
    new ethereum.EventParam('reason', ethereum.Value.fromString('with params')),
    new ethereum.EventParam(
      'params',
      ethereum.Value.fromBytes(Bytes.fromHexString('0x1234'))
    ),
  ]

  return event
}

export function createDelegateChangedEvent(
  delegator: string,
  fromDelegate: string,
  toDelegate: string
): DelegateChanged {
  const event = changetype<DelegateChanged>(newMockEvent())

  event.address = Address.fromString(upTokenAddress)
  event.block.timestamp = BigInt.fromI32(130)
  event.parameters = [
    new ethereum.EventParam(
      'delegator',
      ethereum.Value.fromAddress(Address.fromString(delegator))
    ),
    new ethereum.EventParam(
      'fromDelegate',
      ethereum.Value.fromAddress(Address.fromString(fromDelegate))
    ),
    new ethereum.EventParam(
      'toDelegate',
      ethereum.Value.fromAddress(Address.fromString(toDelegate))
    ),
  ]

  return event
}

export function createDelegateVotesChangedEvent(
  delegate: string,
  previousVotes: BigInt,
  newVotes: BigInt
): DelegateVotesChanged {
  const event = changetype<DelegateVotesChanged>(newMockEvent())

  event.address = Address.fromString(upTokenAddress)
  event.block.timestamp = BigInt.fromI32(140)
  event.parameters = [
    new ethereum.EventParam(
      'delegate',
      ethereum.Value.fromAddress(Address.fromString(delegate))
    ),
    new ethereum.EventParam(
      'previousVotes',
      ethereum.Value.fromUnsignedBigInt(previousVotes)
    ),
    new ethereum.EventParam(
      'newVotes',
      ethereum.Value.fromUnsignedBigInt(newVotes)
    ),
  ]

  return event
}

export function createProposalQueuedEvent(
  proposalId: BigInt,
  etaSeconds: BigInt
): ProposalQueued {
  const event = changetype<ProposalQueued>(newMockEvent())

  event.address = Address.fromString(governorAddress)
  event.block.timestamp = BigInt.fromI32(160)
  event.parameters = [
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromUnsignedBigInt(proposalId)
    ),
    new ethereum.EventParam(
      'etaSeconds',
      ethereum.Value.fromUnsignedBigInt(etaSeconds)
    ),
  ]

  return event
}

export function createProposalExecutedEvent(
  proposalId: BigInt
): ProposalExecuted {
  const event = changetype<ProposalExecuted>(newMockEvent())

  event.address = Address.fromString(governorAddress)
  event.block.timestamp = BigInt.fromI32(170)
  event.parameters = [
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromUnsignedBigInt(proposalId)
    ),
  ]

  return event
}

export function createProposalCanceledEvent(
  proposalId: BigInt
): ProposalCanceled {
  const event = changetype<ProposalCanceled>(newMockEvent())

  event.address = Address.fromString(governorAddress)
  event.block.timestamp = BigInt.fromI32(180)
  event.parameters = [
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromUnsignedBigInt(proposalId)
    ),
  ]

  return event
}

export function createTransferEvent(
  from: string,
  to: string,
  value: BigInt
): Transfer {
  const event = changetype<Transfer>(newMockEvent())

  event.address = Address.fromString(upTokenAddress)
  event.block.timestamp = BigInt.fromI32(150)
  event.parameters = [
    new ethereum.EventParam(
      'from',
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      'to',
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value)),
  ]

  return event
}
