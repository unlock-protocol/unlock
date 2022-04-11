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
  KeyExtended,
} from '../../generated/templates/PublicLock10/PublicLock'

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

export function cancelKey(event: CancelKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let key = Key.load(keyID)
  let lockContract = PublicLock.bind(event.address)
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.tokenId)
  key.save()
}

export function expirationChanged(event: ExpirationChanged): void {
  let keyID = genKeyID(event.address, event.params._tokenId.toString())
  let key = Key.load(keyID)
  let lockContract = PublicLock.bind(event.address)
  key.expiration = lockContract.keyExpirationTimestampFor(event.params._tokenId)
  key.save()
}

export function expireKey(event: ExpireKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let key = Key.load(keyID)

  key.expiration = event.block.timestamp

  key.save()
}

export function lockManagerAdded(event: LockManagerAdded): void {
  let lockAddress = event.address.toHex()
  let manager = event.params.account.toHex()

  let lockManager = new LockManager(lockAddress.concat(manager))
  lockManager.lock = lockAddress
  lockManager.address = event.params.account
  lockManager.save()
}

export function lockManagerRemoved(event: LockManagerRemoved): void {
  let lockAddress = event.address.toHex()
  let manager = event.params.account.toHex()

  store.remove('LockManager', lockAddress.concat(manager))
}

export function pricingChanged(event: PricingChanged): void {
  let lockAddress = event.address.toHex()
  let lock = Lock.load(lockAddress)
  lock.price = event.params.keyPrice
  lock.tokenAddress = event.params.tokenAddress
  lock.save()
}

/**
 * Event triggered on key renewed.
 *  - tokenId
 *  - newTimestamp
 * @param event
 */
export function extendKey(event: KeyExtended): void {
  let lockContract = PublicLock.bind(event.address)

  let { tokenId } = event.params

  // Get the KeyId
  let keyID = genKeyID(event.address, tokenId.toString())

  // Load the key
  let key = Key.load(keyID)

  // Update its expiration
  key.expiration = lockContract.keyExpirationTimestampFor(
    BigInt.fromI32(tokenId)
  )
  key.save()
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
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.tokenId)
  key.save()
}

function genKey(event: Transfer, lockContract: PublicLock): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString())

  newlyMintedKey(event)
  let key = new Key(keyID)
  key.lock = event.address.toHex()
  key.keyId = event.params.tokenId
  key.owner = event.params.to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.tokenId)
  key.tokenURI = lockContract.tokenURI(key.keyId)
  key.createdAt = event.block.timestamp

  let lock = Lock.load(key.lock)

  if (lock.version > BigInt.fromI32(0)) {
    let tokenURI = lockContract.try_tokenURI(key.keyId)

    if (!tokenURI.reverted) {
      key.tokenURI = lockContract.tokenURI(key.keyId)
    }
  }

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

export function transfer(event: Transfer): void {
  let lock = Lock.load(event.address.toHex()) as Lock
  let zeroAddress = '0x0000000000000000000000000000000000000000'
  let lockContract = PublicLock.bind(event.address)

  // When using === the strings are different.
  // eslint-disable-next-line eqeqeq
  if (event.params.from.toHex() == zeroAddress) {
    newKeyPurchase(event, lock, lockContract)
  } else {
    existingKeyTransfer(event)
  }
}
