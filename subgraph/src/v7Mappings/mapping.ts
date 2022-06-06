/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-const */
import { Address, Bytes, BigInt, store } from '@graphprotocol/graph-ts'
import {
  Lock,
  LockManager,
  KeyHolder,
  Key,
  KeyPurchase,
} from '../../generated/schema'
import {
  ExpireKey,
  CancelKey,
  ExpirationChanged,
  LockManagerAdded,
  LockManagerRemoved,
  PricingChanged,
  Transfer,
  PublicLock,
  RenewKeyPurchase,
} from '../../generated/templates/PublicLock7/PublicLock'

import * as v10Events from '../../generated/templates/PublicLock10/PublicLock'
import * as v10 from '../v10Mappings/mapping'

/**
 * Helper function to get the version and handle things accordingly...
 * @param publicLock
 * @returns
 */
function getVersion(publicLock: PublicLock): BigInt {
  let version = publicLock.try_publicLockVersion()
  let lock = new Lock(publicLock._address.toHexString())
  if (!version.reverted) {
    return version.value
  } else {
    return BigInt.fromI32(0)
  }
}

/**
 * Helper function to get the version and handle things accordingly...
 * @param publicLock
 * @returns
 */
function isV10OrAbove(publicLock: PublicLock): bool {
  let version = getVersion(publicLock)
  return version.ge(BigInt.fromI32(10))
}

function loadKeyHolder(id: string): KeyHolder {
  let keyHolder = KeyHolder.load(id)

  if (keyHolder != null) {
    return keyHolder as KeyHolder
  }
  let newKeyHolder = new KeyHolder(id)
  newKeyHolder.address = Address.fromString(id)
  return newKeyHolder
}

function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress.toHex().concat('-').concat(tokenId)
}

function newlyMintedKey(event: Transfer): void {
  let keyHolder = loadKeyHolder(event.params.to.toHex())
  keyHolder.save()
}

function existingKeyTransfer(event: Transfer): void {
  let lockContract = PublicLock.bind(event.address)
  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let key = Key.load(keyID)

  let keyHolder = loadKeyHolder(event.params.to.toHex())
  keyHolder.save()

  key.owner = event.params.to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.to)
  key.save()
}

function genKey(event: Transfer, lockContract: PublicLock): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString())

  newlyMintedKey(event)
  let key = new Key(keyID)
  key.lock = event.address.toHex()
  key.keyId = event.params.tokenId
  key.owner = event.params.to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.to)
  key.tokenURI = lockContract.tokenURI(key.keyId)
  key.createdAt = event.block.timestamp
  key.save()
}

function genKeyPurchase(
  keyID: string,
  purchaser: Bytes,
  lock: Bytes,
  timestamp: BigInt,
  tokenAddress: Bytes,
  price: BigInt
): void {
  let keyPurchase = new KeyPurchase(keyID)
  keyPurchase.purchaser = purchaser
  keyPurchase.lock = lock
  keyPurchase.timestamp = timestamp
  keyPurchase.tokenAddress = tokenAddress
  keyPurchase.price = price
  keyPurchase.save()
}

function newKeyPurchase(
  event: Transfer,
  lock: Lock,
  lockContract: PublicLock
): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let keyPurchaseID = keyID.concat('-').concat(event.block.number.toString())

  genKey(event, lockContract)

  let tokenAddress = lockContract.try_tokenAddress()

  if (!tokenAddress.reverted) {
    lock.tokenAddress = tokenAddress.value
  } else {
    lock.tokenAddress = Address.fromString(
      '0000000000000000000000000000000000000000'
    )
  }

  genKeyPurchase(
    keyPurchaseID,
    event.params.to,
    event.address,
    event.block.timestamp,
    lock.tokenAddress as Bytes,
    lockContract.keyPrice()
  )
}

/**
 * Event triggered on key renewed.
 *  - owner
 * @param event
 */
export function renewKeyPurchase(event: RenewKeyPurchase): void {
  let lockContract = PublicLock.bind(event.address)

  let tokenId = lockContract.getTokenIdFor(event.params.owner)

  // Get the KeyId
  let keyID = genKeyID(event.address, tokenId.toString())

  // Load the key
  let key = Key.load(keyID)

  // Update its expiration
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.owner)
  key.save()
}

export function transfer(event: Transfer): void {
  let lockContract = PublicLock.bind(event.address)
  if (isV10OrAbove(lockContract)) {
    v10.transfer(event as v10Events.Transfer)
  }

  let lock = Lock.load(event.address.toHex()) as Lock
  let zeroAddress = '0x0000000000000000000000000000000000000000'

  // When using === the strings are different.
  // eslint-disable-next-line eqeqeq
  if (event.params.from.toHex() == zeroAddress) {
    newKeyPurchase(event, lock, lockContract)
  } else {
    existingKeyTransfer(event)
  }
}

export function cancelKey(event: CancelKey): void {
  let lockContract = PublicLock.bind(event.address)
  if (isV10OrAbove(lockContract)) {
    v10.cancelKey(event as v10Events.CancelKey)
  }
  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let key = Key.load(keyID)
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.owner)
  key.save()
}

export function expirationChanged(event: ExpirationChanged): void {
  let lockContract = PublicLock.bind(event.address)
  if (isV10OrAbove(lockContract)) {
    v10.expirationChanged(event as v10Events.ExpirationChanged)
  }
  let keyID = genKeyID(event.address, event.params._tokenId.toString())
  let key = Key.load(keyID)
  let keyOwnwer = lockContract.ownerOf(event.params._tokenId)
  key.expiration = lockContract.keyExpirationTimestampFor(keyOwnwer)
  key.save()
}

export function expireKey(event: ExpireKey): void {
  let lockContract = PublicLock.bind(event.address)
  if (isV10OrAbove(lockContract)) {
    v10.expireKey(event as v10Events.ExpireKey)
  }

  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let key = Key.load(keyID)

  key.expiration = event.block.timestamp

  key.save()
}

export function lockManagerAdded(event: LockManagerAdded): void {
  let lockContract = PublicLock.bind(event.address)
  if (isV10OrAbove(lockContract)) {
    v10.lockManagerAdded(event as v10Events.LockManagerAdded)
  }
  let lockAddress = event.address.toHex()
  let manager = event.params.account.toHex()

  let lockManager = new LockManager(lockAddress.concat(manager))
  lockManager.lock = lockAddress
  lockManager.address = event.params.account
  lockManager.save()
}

export function lockManagerRemoved(event: LockManagerRemoved): void {
  let lockContract = PublicLock.bind(event.address)
  if (isV10OrAbove(lockContract)) {
    v10.lockManagerRemoved(event as v10Events.LockManagerRemoved)
  }

  let lockAddress = event.address.toHex()
  let manager = event.params.account.toHex()

  store.remove('LockManager', lockAddress.concat(manager))
}

export function pricingChanged(event: PricingChanged): void {
  let lockContract = PublicLock.bind(event.address)
  if (isV10OrAbove(lockContract)) {
    v10.pricingChanged(event as v10Events.PricingChanged)
  }

  let lockAddress = event.address.toHex()
  let lock = Lock.load(lockAddress)
  lock.price = event.params.keyPrice
  lock.tokenAddress = event.params.tokenAddress
  lock.save()
}
