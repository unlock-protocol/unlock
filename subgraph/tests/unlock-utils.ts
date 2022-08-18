import { newMockEvent } from 'matchstick-as'
import { ethereum, Address } from '@graphprotocol/graph-ts'
import { NewLock } from '../generated/Unlock/Unlock'

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
