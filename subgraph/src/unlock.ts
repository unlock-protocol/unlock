/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { log, BigInt } from '@graphprotocol/graph-ts'
import { NewLock } from '../generated/Unlock/Unlock'
import { PublicLock } from '../generated/templates/PublicLock/PublicLock'
import { Lock } from '../generated/schema'

export function handleNewLock(event: NewLock): void {
  let lockAddress = event.params.newLockAddress

  // create new lock
  let lockID = lockAddress.toHexString()
  const lock = new Lock(lockID)

  // fetch lock version
  let publicLock = PublicLock.bind(lockAddress)
  let version = BigInt.fromI32(0)
  let publicLockVersion = publicLock.try_publicLockVersion()
  if (!publicLockVersion.reverted) {
    version = BigInt.fromI32(publicLockVersion.value)
  }

  // store info
  lock.address = lockAddress
  lock.version = version
  lock.createdAtBlock = event.block.number
  lock.lockManagers = [event.params.lockOwner]
  lock.save()

  log.debug('New lock: {}, v{}', [lockID, lock.version])
}
