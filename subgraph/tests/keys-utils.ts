import { newMockEvent } from 'matchstick-as'
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts'
import {
  CancelKey,
  ExpirationChanged,
  ExpireKey,
  KeyExtended,
  KeyManagerChanged,
  LockManagerAdded,
  LockManagerRemoved,
  PricingChanged,
  Transfer,
} from '../generated/templates/PublicLock/PublicLock'

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  const transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = []

  transferEvent.parameters.push(
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createExpirationChangedEvent(
  _tokenId: BigInt,
  _amount: BigInt,
  _timeAdded: boolean
): ExpirationChanged {
  const expirationChangedEvent = changetype<ExpirationChanged>(newMockEvent())

  expirationChangedEvent.parameters = []

  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_tokenId',
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )
  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_amount',
      ethereum.Value.fromUnsignedBigInt(_amount)
    )
  )
  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_timeAdded',
      ethereum.Value.fromBoolean(_timeAdded)
    )
  )

  return expirationChangedEvent
}

export function createKeyManagerChangedEvent(
  _tokenId: BigInt,
  _newManager: Address
): KeyManagerChanged {
  const keyManagerChangedEvent = changetype<KeyManagerChanged>(newMockEvent())

  keyManagerChangedEvent.parameters = []

  keyManagerChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_tokenId',
      ethereum.Value.fromUnsignedBigInt(_tokenId)
    )
  )
  keyManagerChangedEvent.parameters.push(
    new ethereum.EventParam(
      '_newManager',
      ethereum.Value.fromAddress(_newManager)
    )
  )

  return keyManagerChangedEvent
}

export function createCancelKeyEvent(
  tokenId: BigInt
  // owner: Address,
  // sendTo: Address,
  // refund: bigint
): CancelKey {
  const cancelKeyEvent = changetype<CancelKey>(newMockEvent())

  cancelKeyEvent.parameters = []

  cancelKeyEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  // cancelKeyEvent.parameters.push(
  //   new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner))
  // )
  // cancelKeyEvent.parameters.push(
  //   new ethereum.EventParam('sendTo', ethereum.Value.fromAddress(sendTo))
  // )
  // cancelKeyEvent.parameters.push(
  //   new ethereum.EventParam('refund', ethereum.Value.fromUnsignedBigInt(refund))
  // )

  return cancelKeyEvent
}

// TODO: all functions below
export function createExpireKeyEvent(tokenId: bigint): ExpireKey {
  const expireKeyEvent = changetype<ExpireKey>(newMockEvent())

  expireKeyEvent.parameters = []

  expireKeyEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return expireKeyEvent
}

export function createKeyExtendedEvent(
  tokenId: bigint,
  newTimestamp: bigint
): KeyExtended {
  const keyExtendedEvent = changetype<KeyExtended>(newMockEvent())

  keyExtendedEvent.parameters = []

  keyExtendedEvent.parameters.push(
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  keyExtendedEvent.parameters.push(
    new ethereum.EventParam(
      'newTimestamp',
      ethereum.Value.fromUnsignedBigInt(newTimestamp)
    )
  )

  return keyExtendedEvent
}

export function createLockManagerAddedEvent(
  account: Address
): LockManagerAdded {
  const lockManagerAddedEvent = changetype<LockManagerAdded>(newMockEvent())

  lockManagerAddedEvent.parameters = []

  lockManagerAddedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return lockManagerAddedEvent
}

export function createLockManagerRemovedEvent(
  account: Address
): LockManagerRemoved {
  const lockManagerRemovedEvent = changetype<LockManagerRemoved>(newMockEvent())

  lockManagerRemovedEvent.parameters = []

  lockManagerRemovedEvent.parameters.push(
    new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  )

  return lockManagerRemovedEvent
}

export function createPricingChangedEvent(
  oldKeyPrice: bigint,
  keyPrice: bigint,
  oldTokenAddress: Address,
  tokenAddress: Address
): PricingChanged {
  const pricingChangedEvent = changetype<PricingChanged>(newMockEvent())

  pricingChangedEvent.parameters = []

  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'oldKeyPrice',
      ethereum.Value.fromUnsignedBigInt(oldKeyPrice)
    )
  )
  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'keyPrice',
      ethereum.Value.fromUnsignedBigInt(keyPrice)
    )
  )
  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'oldTokenAddress',
      ethereum.Value.fromAddress(oldTokenAddress)
    )
  )
  pricingChangedEvent.parameters.push(
    new ethereum.EventParam(
      'tokenAddress',
      ethereum.Value.fromAddress(tokenAddress)
    )
  )

  return pricingChangedEvent
}
