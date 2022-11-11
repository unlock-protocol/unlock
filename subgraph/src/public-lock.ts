import { Address, BigInt, log, Bytes, store } from '@graphprotocol/graph-ts'

import {
  CancelKey as CancelKeyEvent,
  ExpirationChanged as ExpirationChangedUntilV11Event,
  ExpirationChanged1 as ExpirationChangedEvent,
  ExpireKey as ExpireKeyEvent,
  KeyExtended as KeyExtendedEvent,
  RoleGranted as RoleGrantedEvent,
  KeyManagerChanged as KeyManagerChangedEvent,
  LockManagerAdded as LockManagerAddedEvent,
  LockManagerRemoved as LockManagerRemovedEvent,
  PricingChanged as PricingChangedEvent,
  RenewKeyPurchase as RenewKeyPurchaseEvent,
  Transfer as TransferEvent,
  LockMetadata as LockMetadataEvent,
  LockConfig as LockConfigEvent,
} from '../generated/templates/PublicLock/PublicLock'

import { PublicLockV11 as PublicLock } from '../generated/templates/PublicLock/PublicLockV11'
import { Key, Lock } from '../generated/schema'

import { genKeyID, getKeyExpirationTimestampFor, LOCK_MANAGER } from './helpers'

function newKey(event: TransferEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = new Key(keyID)
  key.lock = event.address.toHexString()
  key.tokenId = event.params.tokenId
  key.owner = event.params.to
  key.createdAtBlock = event.block.number

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
  key.save()

  // update lock
  const lock = Lock.load(event.address.toHexString())
  if (lock) {
    lock.totalKeys = lock.totalKeys.plus(BigInt.fromI32(1))
    lock.save()
  }
}

export function handleLockConfig(event: LockConfigEvent): void {
  const lock = Lock.load(event.address.toHexString())
  if (lock) {
    lock.expirationDuration = event.params.expirationDuration
    lock.maxNumberOfKeys = event.params.maxNumberOfKeys
    lock.maxKeysPerAddress = event.params.maxKeysPerAddress
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
  } else {
    // existing key has been transferred
    const keyID = genKeyID(event.address, event.params.tokenId.toString())
    const key = Key.load(keyID)
    if (key) {
      key.owner = event.params.to
      key.expiration = getKeyExpirationTimestampFor(
        event.address,
        event.params.tokenId,
        event.params.to
      )
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
  if (key) {
    // remove cancelled keys for v11
    const lock = Lock.load(key.lock)
    if (lock && lock.version == BigInt.fromI32(11)) {
      store.remove('Key', keyID)
    } else {
      key.cancelled = true
      key.save()
    }
  }
}

export function handleKeyExtended(event: KeyExtendedEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    key.expiration = event.params.newTimestamp
    key.save()
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
    key.expiration = event.params.newExpiration
    key.save()
  }
}

// NB: Up to PublicLock v8, we handle the addition of a new lock managers 
// with our custom event `LockManagerAdded`. Starting from v9,
// we use OpenZeppelin native `RoleGranted` event.
export function handleRoleGranted(event: RoleGrantedEvent): void {
  if (
    event.params.role.toHexString() ==
    Bytes.fromHexString(LOCK_MANAGER).toHexString()
  ) {
    const lock = Lock.load(event.address.toHexString())
    if (lock) {
      const lockManagers = lock.lockManagers
      if (
        lock.lockManagers &&
        lock.lockManagers.length &&
        lock.lockManagers.includes(event.params.account)
      ) {
        lockManagers.push(event.params.account)
      } else {
        lock.lockManagers = [event.params.account]
      }
      lock.save()
      log.debug('Lock manager {} added to lock: {}', [
        event.params.account.toHexString(),
        event.address.toHexString(),
      ])
    }
  }
}

// `LockManagerAdded` event is used only until v8
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
  if (lock && lock.lockManagers) {
    let newManagers: Bytes[] = []
    for (let i = 0; i < lock.lockManagers.length; i++) {
      const managerAddress = lock.lockManagers[i]
      if (managerAddress != event.params.account) {
        newManagers.push(managerAddress)
      }
    }
    lock.lockManagers = newManagers;
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
    if (
      !baseTokenURI.reverted &&
      baseTokenURI.value !== event.params.baseTokenURI
    ) {
      for (let i = 0; i < totalKeys.toI32(); i++) {
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
