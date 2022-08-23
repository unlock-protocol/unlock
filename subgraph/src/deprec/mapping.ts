/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { BigInt } from '@graphprotocol/graph-ts'
import { NewLock, CreateLockCall } from '../generated/Unlock/Unlock'
import { processNewLock } from './lockProcessing'

export function handleNewLock(event: NewLock): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entityId = event.transaction.hash.toHex()
  let entity = UnlockEntity.load(entityId)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new UnlockEntity(entityId)
    entity.count = BigInt.fromI32(0)
  }

  entity.count = BigInt.fromI32(1).plus(entity.count)
  entity.lockOwner = event.params.lockOwner
  entity.newLockAddress = event.params.newLockAddress
  entity.save()

  processNewLock(event)
}

export function handleCreateLock(call: CreateLockCall): void {
  let entityId = call.transaction.hash.toHex()
  let entity = UnlockEntity.load(entityId)

  if (entity == null) {
    entity = new UnlockEntity(entityId)
  }

  entity.save()
}
