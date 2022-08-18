/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import {
  NewLock,
  NewTokenURI,
  NewGlobalTokenSymbol,
  OwnershipTransferred,
} from '../generated/Unlock/Unlock'
import { Lock } from '../generated/schema'

export function handleNewLock(event: NewLock): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entityId = event.transaction.hash.toHex()
  let entity = Lock.load(entityId)

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new Lock(entityId)
  }

  entity.address = event.params.newLockAddress
  entity.createdAtBlock = event.block.number
  entity.save()

  // trigger lock parsing
  // processNewLock(event)
}

export function handleNewTokenURI(_event: NewTokenURI): void {}
export function handleNewGlobalTokenSymbol(
  _event: NewGlobalTokenSymbol
): void {}
export function handleOwnershipTransferred(
  _event: OwnershipTransferred
): void {}
