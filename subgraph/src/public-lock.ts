import { Address, BigInt, log, Bytes, store } from '@graphprotocol/graph-ts'
import {
  CancelKey as CancelKeyEvent,
  ExpirationChanged as ExpirationChangedUntilV11Event,
  ExpirationChanged1 as ExpirationChangedEvent,
  ExpireKey as ExpireKeyEvent,
  KeyExtended as KeyExtendedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  KeyManagerChanged as KeyManagerChangedEvent,
  LockManagerAdded as LockManagerAddedEvent,
  LockManagerRemoved as LockManagerRemovedEvent,
  PricingChanged as PricingChangedEvent,
  RenewKeyPurchase as RenewKeyPurchaseEvent,
  Transfer as TransferEvent,
  LockMetadata as LockMetadataEvent,
  LockConfig as LockConfigEvent,
  ReferrerFee as ReferrerFeeEvent,
  KeyGranterAdded as KeyGranterAddedEvent,
  KeyGranterRemoved as KeyGranterRemovedEvent,
} from '../generated/templates/PublicLock/PublicLock'

import { PublicLockV11 as PublicLock } from '../generated/templates/PublicLock/PublicLockV11'
import {
  Key,
  Lock,
  UnlockStats,
  LockStats,
  ReferrerFee,
} from '../generated/schema'

import {
  genKeyID,
  getKeyExpirationTimestampFor,
  loadOrCreateUnlockDailyData,
  getKeyManagerOf,
  LOCK_MANAGER,
  addTransactionHashToKey,
  KEY_GRANTER,
} from './helpers'
import { tryCreateCancelReceipt, createReceipt } from './receipt'

function newKey(event: TransferEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = new Key(keyID)
  key.lock = event.address.toHexString()
  key.tokenId = event.params.tokenId
  key.owner = event.params.to
  key.createdAt = event.block.timestamp
  key.createdAtBlock = event.block.number
  key.cancelled = false

  const lockContract = PublicLock.bind(event.address)
  const tokenURI = lockContract.try_tokenURI(event.params.tokenId)
  if (!tokenURI.reverted) {
    key.tokenURI = tokenURI.value
  }
  key.expiration = getKeyExpirationTimestampFor(
    event.address,
    event.params.tokenId,
    event.params.to
  )

  key.manager = getKeyManagerOf(
    event.address,
    event.params.tokenId,
    event.params.to
  )

  addTransactionHashToKey(key, event.transaction.hash.toHexString())
  key.save()

  createReceipt(event)

  // update lock
  const lock = Lock.load(event.address.toHexString())
  if (lock) {
    lock.totalKeys = lock.totalKeys.plus(BigInt.fromI32(1))
    lock.lastKeyMintedAt = event.block.timestamp
    lock.save()
  }

  // update lockDayData
  const unlockDailyData = loadOrCreateUnlockDailyData(event.block.timestamp)
  const activeLocks = unlockDailyData.activeLocks
  unlockDailyData.keysSold = unlockDailyData.keysSold.plus(BigInt.fromI32(1))
  unlockDailyData.totalKeysSold = unlockDailyData.totalKeysSold.plus(
    BigInt.fromI32(1)
  )
  if (activeLocks && !activeLocks.includes(event.address)) {
    activeLocks.push(event.address)
    unlockDailyData.activeLocks = activeLocks
  }
  unlockDailyData.save()

  const unlockStats = UnlockStats.load('0')
  if (unlockStats) {
    // This always exists because for a key to be minted, the lock needs to have been deployed!
    unlockStats.totalKeysSold = unlockStats.totalKeysSold.plus(
      BigInt.fromI32(1)
    )
    unlockStats.save()
  }

  // update lockStats
  const lockStats = LockStats.load('Unlock')
  if (lockStats) {
    lockStats.totalKeysSold = lockStats.totalKeysSold.plus(BigInt.fromI32(1))
    lockStats.save()
  }
}

export function handleLockConfig(event: LockConfigEvent): void {
  const lock = Lock.load(event.address.toHexString())
  if (lock) {
    lock.expirationDuration = event.params.expirationDuration
    lock.maxNumberOfKeys = event.params.maxNumberOfKeys
    lock.maxKeysPerAddress = event.params.maxKeysPerAcccount
    lock.save()
  }
}

export function handleTransfer(event: TransferEvent): void {
  const zeroAddress = '0x0000000000000000000000000000000000000000'
  if (event.params.from.toHex() == zeroAddress) {
    // create key
    newKey(event)
  } else if (event.params.to.toHex() == zeroAddress) {
    // burn key
    const lock = Lock.load(event.address.toHexString())
    if (lock) {
      lock.totalKeys = lock.totalKeys.minus(BigInt.fromI32(1))
      lock.save()
    }

    // delete record of burned key
    const keyID = genKeyID(event.address, event.params.tokenId.toString())
    const key = Key.load(keyID)
    if (key) {
      store.remove('Key', keyID)
    }
  } else {
    // existing key has been transferred
    const keyID = genKeyID(event.address, event.params.tokenId.toString())
    const key = Key.load(keyID)
    if (key) {
      key.owner = event.params.to
      const expiration = getKeyExpirationTimestampFor(
        event.address,
        event.params.tokenId,
        event.params.to
      )

      key.expiration = expiration
      key.save()
    }
  }
}

export function handleExpireKey(event: ExpireKeyEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    key.expiration = getKeyExpirationTimestampFor(
      event.address,
      event.params.tokenId,
      Address.fromBytes(key.owner)
    )
    key.save()
  }
}

export function handleExpirationChangedUntilV11(
  event: ExpirationChangedUntilV11Event
): void {
  const keyID = genKeyID(event.address, event.params._tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    key.expiration = getKeyExpirationTimestampFor(
      event.address,
      event.params._tokenId,
      Address.fromBytes(key.owner)
    )
    key.save()
  }
}

export function handleExpirationChanged(event: ExpirationChangedEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    key.expiration = getKeyExpirationTimestampFor(
      event.address,
      event.params.tokenId,
      Address.fromBytes(key.owner)
    )
    key.save()
  }
}

export function handleKeyManagerChanged(event: KeyManagerChangedEvent): void {
  const keyID = genKeyID(event.address, event.params._tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    key.manager = event.params._newManager
    key.save()
  }
}

export function handleCancelKey(event: CancelKeyEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  const fallbackTimestamp = event.block.timestamp
  const lockContract = PublicLock.bind(event.address)
  if (key) {
    // Due to a bug in v11, we need to check the version of the lock and fallback to the timestamp since expiration can be for a different key
    const lock = Lock.load(key.lock)
    if (lock && lock.version == BigInt.fromI32(11)) {
      key.expiration = fallbackTimestamp
    } else {
      key.expiration = getKeyExpirationTimestampFor(
        event.address,
        event.params.tokenId,
        Address.fromBytes(key.owner)
      )
    }
    const owner = lockContract.ownerOf(key.tokenId)
    key.owner = owner
    key.cancelled = true
    key.save()

    // If the receipt was created add transaction hash to the key
    if (tryCreateCancelReceipt(event)) {
      addTransactionHashToKey(key, event.transaction.hash.toHexString())
    }
  }
}

export function handleKeyExtended(event: KeyExtendedEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    addTransactionHashToKey(key, event.transaction.hash.toHexString())
    key.expiration = event.params.newTimestamp
    key.cancelled = false
    key.save()

    const lock = Lock.load(key.lock)
    if (lock) {
      lock.lastKeyRenewedAt = event.block.timestamp
      lock.save()
    }

    // create receipt
    createReceipt(event)
  }
}

// from < v10 (before using tokenId accross the board)
export function handleRenewKeyPurchase(event: RenewKeyPurchaseEvent): void {
  const lockContract = PublicLock.bind(event.address)

  const tokenId = lockContract.try_tokenOfOwnerByIndex(
    event.params.owner,
    BigInt.fromI32(0) // always the first token
  )
  const keyID = genKeyID(event.address, tokenId.value.toString())
  const key = Key.load(keyID)
  if (key) {
    addTransactionHashToKey(key, event.transaction.hash.toHexString())
    key.expiration = event.params.newExpiration
    key.cancelled = false
    key.save()

    const lock = Lock.load(key.lock)
    if (lock) {
      lock.lastKeyRenewedAt = event.block.timestamp
      lock.save()
    }
  }

  // create receipt
  createReceipt(event)
}

// we use OpenZeppelin native `RoleGranted` event since v9
export function handleRoleGranted(event: RoleGrantedEvent): void {
  if (
    event.params.role.toHexString() ==
    Bytes.fromHexString(LOCK_MANAGER).toHexString()
  ) {
    const lock = Lock.load(event.address.toHexString())
    if (lock) {
      const lockManagers = lock.lockManagers
      if (lockManagers && lockManagers.length) {
        if (!lockManagers.includes(event.params.account)) {
          lockManagers.push(event.params.account)
          lock.lockManagers = lockManagers
        }
      } else {
        lock.lockManagers = [event.params.account]
      }
      lock.save()
      log.debug('New lock manager', [event.params.account.toHexString()])
    }
  } else if (
    event.params.role.toHexString() ==
    Bytes.fromHexString(KEY_GRANTER).toHexString()
  ) {
    const lock = Lock.load(event.address.toHexString())
    if (lock) {
      const keyGranters = lock.keyGranters
      if (keyGranters && keyGranters.length) {
        if (!keyGranters.includes(event.params.account)) {
          keyGranters.push(event.params.account)
          lock.keyGranters = keyGranters
        }
      } else {
        lock.keyGranters = [event.params.account]
      }
      lock.save()
    }
  }
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  if (
    event.params.role.toHexString() ==
    Bytes.fromHexString(KEY_GRANTER).toHexString()
  ) {
    const lock = Lock.load(event.address.toHexString())
    if (lock && lock.keyGranters) {
      const newKeyGranters: Bytes[] = []
      for (let i = 0; i < lock.keyGranters.length; i++) {
        const keyGranter = lock.keyGranters[i]
        if (keyGranter != event.params.account) {
          newKeyGranters.push(keyGranter)
        }
      }
      lock.keyGranters = newKeyGranters
      lock.save()
    }
  } else if (
    event.params.role.toHexString() ==
    Bytes.fromHexString(LOCK_MANAGER).toHexString()
  ) {
    const lock = Lock.load(event.address.toHexString())
    if (lock && lock.lockManagers) {
      const newManagers: Bytes[] = []
      for (let i = 0; i < lock.lockManagers.length; i++) {
        const managerAddress = lock.lockManagers[i]
        if (managerAddress != event.params.account) {
          newManagers.push(managerAddress)
        }
      }
      lock.lockManagers = newManagers
      lock.save()
    }
  }
}

export function handleKeyGranterAdded(event: KeyGranterAddedEvent): void {
  const lock = Lock.load(event.address.toHexString())
  // custom events used only for version prior to v8
  if (lock && lock.version.le(BigInt.fromI32(8)) && lock.keyGranters) {
    const keyGranters = lock.keyGranters
    keyGranters.push(event.params.account)
    lock.keyGranters = keyGranters
    lock.save()
    log.debug('Key Manager {} added to {}', [
      event.params.account.toHexString(),
      event.address.toHexString(),
    ])
  }
}

export function handleKeyGranterRemoved(event: KeyGranterRemovedEvent): void {
  const lock = Lock.load(event.address.toHexString())
  // custom events used only for version prior to v8
  if (lock && lock.version.le(BigInt.fromI32(8)) && lock.keyGranters) {
    const newKeyGranters: Bytes[] = []
    for (let i = 0; i < lock.keyGranters.length; i++) {
      const keyGranterAddress = lock.keyGranters[i]
      if (keyGranterAddress != event.params.account) {
        newKeyGranters.push(keyGranterAddress)
      }
    }
    lock.keyGranters = newKeyGranters
    lock.save()
  }
}

// `LockManagerAdded` event is replaced by OZ native Roles event
export function handleLockManagerAdded(event: LockManagerAddedEvent): void {
  const lock = Lock.load(event.address.toHexString())

  if (lock && lock.lockManagers && lock.version.le(BigInt.fromI32(8))) {
    const lockManagers = lock.lockManagers
    lockManagers.push(event.params.account)
    lock.lockManagers = lockManagers
    lock.save()
    log.debug('Lock manager {} added to {}', [
      event.params.account.toHexString(),
      event.address.toHexString(),
    ])
  }
}

export function handleLockManagerRemoved(event: LockManagerRemovedEvent): void {
  const lock = Lock.load(event.address.toHexString())
  if (lock && lock.lockManagers && lock.version.le(BigInt.fromI32(8))) {
    const newManagers: Bytes[] = []
    for (let i = 0; i < lock.lockManagers.length; i++) {
      const managerAddress = lock.lockManagers[i]
      if (managerAddress != event.params.account) {
        newManagers.push(managerAddress)
      }
    }
    lock.lockManagers = newManagers
    lock.save()
  }
}

export function handlePricingChanged(event: PricingChangedEvent): void {
  const lock = Lock.load(event.address.toHexString())
  if (lock) {
    log.debug('Old price: {}, New price: {}', [
      lock.price.toString(),
      event.params.keyPrice.toString(),
    ])
    lock.price = event.params.keyPrice
    lock.tokenAddress = event.params.tokenAddress
    lock.save()
  }
}

export function handleLockMetadata(event: LockMetadataEvent): void {
  const lock = Lock.load(event.address.toHexString())
  const lockContract = PublicLock.bind(event.address)

  if (lock) {
    lock.name = event.params.name
    lock.symbol = event.params.symbol

    // handle change in URI for all keys
    const totalKeys = lock.totalKeys
    const baseTokenURI = lockContract.try_tokenURI(BigInt.fromI32(0))

    // update only if baseTokenURI has changed
    // Unfortunately, this does not scale well.
    // For now we cap at 100 keys.
    // On large collections this times out which then breaks indexing on the subgraph.
    // Relevant links:
    // - discord message: https://discord.com/channels/438038660412342282/438070183794573313/1082786404691628112
    // - github issue: https://github.com/graphprotocol/graph-node/issues/3576
    const keysToMigrate = Math.min(100, totalKeys.toI32())
    if (
      !baseTokenURI.reverted &&
      baseTokenURI.value !== event.params.baseTokenURI
    ) {
      for (let i = 0; i < keysToMigrate; i++) {
        const keyID = genKeyID(event.address, `${i + 1}`)
        const key = Key.load(keyID)
        if (key) {
          const tokenURI = lockContract.try_tokenURI(key.tokenId)
          if (!tokenURI.reverted) {
            key.tokenURI = tokenURI.value
            key.save()
          }
        }
      }
    }

    // lock.symbol = event.params.symbol
    lock.save()
  }
}

export function handleReferrerFees(event: ReferrerFeeEvent): void {
  const lock = Lock.load(event.address.toHexString())

  if (lock) {
    const referrerAddress = event.params.referrer.toHexString()

    let referrerFee = ReferrerFee.load(referrerAddress)

    if (!referrerFee) {
      referrerFee = new ReferrerFee(referrerAddress)
    }

    referrerFee.referrer = event.params.referrer
    referrerFee.fee = event.params.fee
    referrerFee.lock = lock.id
    referrerFee.save()
  }
}
