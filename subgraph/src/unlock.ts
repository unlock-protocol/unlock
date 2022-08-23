/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { NewLock } from '../generated/Unlock/Unlock'
import { PublicLock } from '../generated/templates/PublicLock/PublicLock'
import { Lock } from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

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

  let lockAddress = event.params.newLockAddress

  // fetch lock version
  let publicLock = PublicLock.bind(lockAddress)
  let version = BigInt.fromI32(0)
  let publicLockVersion = publicLock.try_publicLockVersion()
  if (!publicLockVersion.reverted) {
    version = BigInt.fromI32(publicLockVersion.value)
  }

  entity.address = lockAddress
  entity.version = version
  entity.createdAtBlock = event.block.number
  entity.save()
}
