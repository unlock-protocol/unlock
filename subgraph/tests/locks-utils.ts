import { newMockEvent } from 'matchstick-as'
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts'
import { NewLock, LockUpgraded } from '../generated/Unlock/Unlock'
import {
  LockManagerAdded,
  LockManagerRemoved,
} from '../generated/templates/PublicLock/PublicLock'
import { lockAddress } from './constants'
import { PricingChanged } from '../generated/templates/PublicLock/PublicLock'

export function createNewLockEvent(
  lockOwner: Address,
  newLockAddress: Address
): NewLock {
  const newLockEvent = changetype<NewLock>(newMockEvent())

  newLockEvent.parameters = []

  newLockEvent.parameters.push(
    new ethereum.EventParam('lockOwner', ethereum.Value.fromAddress(lockOwner))
  )
  newLockEvent.parameters.push(
    new ethereum.EventParam(
      'newLockAddress',
      ethereum.Value.fromAddress(newLockAddress)
    )
  )

  return newLockEvent
}

export function createLockManagerAddedEvent(
  newLockManager: Address
): LockManagerAdded {
  const newLockManagerAdded = changetype<LockManagerAdded>(newMockEvent())

  // set existing lock address
  newLockManagerAdded.address = Address.fromString(lockAddress)

  newLockManagerAdded.parameters = [
    new ethereum.EventParam(
      'account',
      ethereum.Value.fromAddress(newLockManager)
    ),
  ]

  return newLockManagerAdded
}

export function createLockManagerRemovedEvent(
  newLockManager: Address
): LockManagerRemoved {
  const newLockManagerRemoved = changetype<LockManagerRemoved>(newMockEvent())

  // set existing lock address
  newLockManagerRemoved.address = Address.fromString(lockAddress)

  newLockManagerRemoved.parameters = [
    new ethereum.EventParam(
      'account',
      ethereum.Value.fromAddress(newLockManager)
    ),
  ]

  return newLockManagerRemoved
}

export function createPricingChangedEvent(
  oldKeyPrice: BigInt,
  keyPrice: BigInt,
  oldTokenAddress: Address,
  tokenAddress: Address
): PricingChanged {
  const pricingChangedEvent = changetype<PricingChanged>(newMockEvent())

  // set existing lock address
  pricingChangedEvent.address = Address.fromString(lockAddress)

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

export function createLockUpgradedEvent(
  lockAddress: Address,
  version: BigInt
): LockUpgraded {
  const lockUpgradedEvent = changetype<LockUpgraded>(newMockEvent())

  // set existing lock address
  lockUpgradedEvent.parameters = []

  lockUpgradedEvent.parameters.push(
    new ethereum.EventParam(
      'lockAddress',
      ethereum.Value.fromAddress(lockAddress)
    )
  )
  lockUpgradedEvent.parameters.push(
    new ethereum.EventParam('version', ethereum.Value.fromI32(version.toI32()))
  )
  return lockUpgradedEvent
}
