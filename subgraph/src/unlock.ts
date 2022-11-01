/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { log, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { NewLock, LockUpgraded } from '../generated/Unlock/Unlock'
import { PublicLock as PublicLockMerged } from '../generated/templates/PublicLock/PublicLock'
import { PublicLock } from '../generated/templates'
import { Lock } from '../generated/schema'
import { LOCK_MANAGER } from './helpers'

const ROLE_GRANTED =
  '0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d'

export function handleNewLock(event: NewLock): void {
  let lockAddress = event.params.newLockAddress

  // create new lock
  let lockID = lockAddress.toHexString()
  const lock = new Lock(lockID)

  // fetch lock version
  let lockContract = PublicLockMerged.bind(lockAddress)
  let version = BigInt.fromI32(0)
  let publicLockVersion = lockContract.try_publicLockVersion()
  if (!publicLockVersion.reverted) {
    version = BigInt.fromI32(publicLockVersion.value.toI32())
  }

  // dont index locks with versions lower than 5
  if (version.lt(BigInt.fromI32(5))) return

  // store lock info from contract
  lock.tokenAddress = lockContract.tokenAddress()
  lock.price = lockContract.keyPrice()
  lock.name = lockContract.name()
  lock.expirationDuration = lockContract.expirationDuration()
  lock.totalKeys = BigInt.fromI32(0)

  // default value
  const symbol = lockContract.try_symbol()
  if (!symbol.reverted) {
    lock.symbol = symbol.value
  } else {
    lock.symbol = 'KEY'
  }

  let maxKeysPerAddress = lockContract.try_maxKeysPerAddress()
  if (!maxKeysPerAddress.reverted) {
    lock.maxKeysPerAddress = maxKeysPerAddress.value
  } else {
    // set to 1 when using address instead of tokenId prior to lock v10
    lock.maxKeysPerAddress = BigInt.fromI32(1)
  }

  let maxNumberOfKeys = lockContract.try_maxNumberOfKeys()
  if (!maxNumberOfKeys.reverted) {
    lock.maxNumberOfKeys = maxNumberOfKeys.value
  }

  // store info from event
  lock.address = lockAddress
  lock.version = version
  lock.createdAtBlock = event.block.number

  // lock managers are parsed from RoleGranted events
  lock.lockManagers = []

  lock.save()

  // instantiate the new lock to start tracking events there
  PublicLock.create(event.params.newLockAddress)

  log.debug('New lock: {}', [lockID])
}

export function handleLockUpgraded(event: LockUpgraded): void {
  let lockAddress = event.params.lockAddress
  const lock = Lock.load(lockAddress.toHexString())
  if (lock) {
    lock.version = BigInt.fromI32(event.params.version)
    lock.save()
  }
}
