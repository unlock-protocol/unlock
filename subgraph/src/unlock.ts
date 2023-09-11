/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { log, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { NewLock, LockUpgraded, GNPChanged } from '../generated/Unlock/Unlock'
import { PublicLock as PublicLockMerged } from '../generated/templates/PublicLock/PublicLock'
import { PublicLock } from '../generated/templates'
import { Lock, LockStats, UnlockStats } from '../generated/schema'
import { loadOrCreateUnlockDailyData, LOCK_MANAGER } from './helpers'

const ROLE_GRANTED =
  '0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d'

export function handleNewLock(event: NewLock): void {
  let lockAddress = event.params.newLockAddress

  // update unlockStats
  let unlockStats = UnlockStats.load('0')
  if (!unlockStats) {
    unlockStats = new UnlockStats('0')
    unlockStats.totalLockDeployed = BigInt.fromI32(0)
    unlockStats.totalKeysSold = BigInt.fromI32(0)
    unlockStats.grossNetworkProduct = BigInt.fromI32(0)
    unlockStats.save()
  }

  // create new lock
  let lockID = lockAddress.toHexString()
  const lock = new Lock(lockID)

  // create new lockStats if not existing
  let lockStats = LockStats.load('Unlock')
  if (lockStats === null) {
    lockStats = new LockStats('Unlock')
    lockStats.totalLocksDeployed = BigInt.fromI32(0)
    lockStats.totalKeysSold = BigInt.fromI32(0)
    lockStats.save()
  } else {
    lockStats.totalLocksDeployed = lockStats.totalLocksDeployed.plus(
      BigInt.fromI32(1)
    )
    lockStats.save()
  }

  // update lockDayData
  const unlockDailyData = loadOrCreateUnlockDailyData(event.block.timestamp)
  unlockDailyData.lockDeployed = unlockDailyData.lockDeployed.plus(
    BigInt.fromI32(1)
  )
  unlockDailyData.totalLockDeployed = unlockDailyData.totalLockDeployed.plus(
    BigInt.fromI32(1)
  )
  unlockDailyData.save()

  unlockStats.totalLockDeployed = unlockStats.totalLockDeployed.plus(
    BigInt.fromI32(1)
  )
  unlockStats.save()

  // fetch lock version
  let lockContract = PublicLockMerged.bind(lockAddress)
  let version = BigInt.fromI32(0)
  let publicLockVersion = lockContract.try_publicLockVersion1()
  if (!publicLockVersion.reverted) {
    version = BigInt.fromI32(publicLockVersion.value)
  }

  // dont index locks with versions lower than 5
  if (version.lt(BigInt.fromI32(5))) return

  // store lock info from contract
  lock.tokenAddress = lockContract.tokenAddress()
  lock.price = lockContract.keyPrice()
  lock.name = lockContract.name()
  lock.expirationDuration = lockContract.expirationDuration()
  lock.totalKeys = BigInt.fromI32(0)
  lock.deployer = event.params.lockOwner // The `lockOwner` name is wrong, as it is in fact msg.sender
  lock.numberOfReceipts = BigInt.fromI32(0)

  // default value
  const symbol = lockContract.try_symbol()
  if (!symbol.reverted) {
    lock.symbol = symbol.value
  } else {
    lock.symbol = 'KEY'
  }

  // maxKeysPerAddress set to 1 prior to lock v10
  lock.maxKeysPerAddress = BigInt.fromI32(1)
  if (version.ge(BigInt.fromI32(9))) {
    let maxKeysPerAddress = lockContract.try_maxKeysPerAddress()
    if (!maxKeysPerAddress.reverted) {
      lock.maxKeysPerAddress = maxKeysPerAddress.value
    }
  }

  let maxNumberOfKeys = lockContract.try_maxNumberOfKeys()
  if (!maxNumberOfKeys.reverted) {
    lock.maxNumberOfKeys = maxNumberOfKeys.value
  }

  // store info from event
  lock.address = lockAddress
  lock.version = version
  lock.createdAtBlock = event.block.number

  if (version.le(BigInt.fromI32(8))) {
    // prior to v8, add default lock manager
    lock.lockManagers = [event.params.lockOwner]
  } else {
    // after v8, lock managers are parsed from `RoleGranted` events
    lock.lockManagers = []
  }

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

export function handleGNPChanged(event: GNPChanged): void {
  const unlockDailyData = loadOrCreateUnlockDailyData(event.block.timestamp)
  unlockDailyData.grossNetworkProduct = event.params.grossNetworkProduct
  unlockDailyData.save()

  const unlockStats = UnlockStats.load('0')
  if (unlockStats) {
    unlockStats.grossNetworkProduct = event.params.grossNetworkProduct
    unlockStats.save()
  }
}
