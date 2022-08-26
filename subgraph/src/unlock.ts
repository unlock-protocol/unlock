/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { log, BigInt } from '@graphprotocol/graph-ts'
import { NewLock, OwnershipTransferred } from '../generated/Unlock/Unlock'
import { PublicLockV11 as PublicLock } from '../generated/templates/PublicLock/PublicLockV11'
import { Lock } from '../generated/schema'

export function handleNewLock(event: NewLock): void {
  let lockAddress = event.params.newLockAddress

  // create new lock
  let lockID = lockAddress.toHexString()
  const lock = new Lock(lockID)

  // fetch lock version
  let lockContract = PublicLock.bind(lockAddress)
  let version = BigInt.fromI32(0)
  let publicLockVersion = lockContract.try_publicLockVersion()
  if (!publicLockVersion.reverted) {
    version = BigInt.fromI32(publicLockVersion.value)
  }

  // store price info
  lock.tokenAddress = lockContract.tokenAddress()
  lock.price = lockContract.keyPrice()

  // store info
  lock.address = lockAddress
  lock.version = version
  lock.createdAtBlock = event.block.number
  lock.lockManagers = [event.params.lockOwner]
  lock.save()

  log.debug('New lock: {}', [lockID])
}

export function handleOwnershipTransferred(
  _event: OwnershipTransferred
): void {}
