import { newMockEvent } from 'matchstick-as'
import { ethereum, Address } from '@graphprotocol/graph-ts'
import { NewLock } from '../generated/Unlock/Unlock'
import {
  LockManagerAdded,
  LockManagerRemoved,
} from '../generated/PublicLock/PublicLock'
import { lockAddress } from './constants'

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
