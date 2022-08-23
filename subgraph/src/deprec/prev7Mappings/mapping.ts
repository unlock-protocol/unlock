/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
/* eslint-disable prefer-destructuring */
import { Address, Bytes, BigInt } from '@graphprotocol/graph-ts'
import { CancelKey, ExpireKey } from '../../generated/Contract/PublicLock'
import {
  Lock,
  KeyHolder,
  Key,
  KeyPurchase,
  LockManager,
} from '../../generated/schema'
import {
  Transfer,
  OwnershipTransferred,
  PriceChanged,
  PublicLock,
} from '../../generated/templates/PublicLock/PublicLock'

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

function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress.toHex().concat('-').concat(tokenId)
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

function newlyMintedKey(event: Transfer): void {
  let keyHolder = loadKeyHolder(event.params._to.toHex())
  keyHolder.save()
}

function genKey(event: Transfer, lockContract: PublicLock): void {
  let keyID = genKeyID(event.address, event.params._tokenId.toString())

  newlyMintedKey(event)
  let key = new Key(keyID)
  key.lock = event.address.toHex()
  key.keyId = event.params._tokenId
  key.owner = event.params._to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params._to)
  // key.tokenURI = lockContract.tokenURI(key.keyId);
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
export function handleLockTransfer(event: OwnershipTransferred): void {
  let lock = Lock.load(event.address.toHex())
  let newOwner = event.params.newOwner
  let previousOwner = event.params.previousOwner

  let newLockManagerId = lock.address.toHex().concat(newOwner.toHex())
  let newLockManager = LockManager.load(newLockManagerId)

  if (newLockManager == null) {
    newLockManager = new LockManager(newLockManagerId)
  }

  newLockManager.lock = lock.address.toHex()
  newLockManager.address = newOwner
  newLockManager.save()

  let existingLockManagerId = lock.address.toHex().concat(previousOwner.toHex())

  let existingLockManager = LockManager.load(existingLockManagerId)

  if (existingLockManager == null) {
    existingLockManager = new LockManager(existingLockManagerId)
  }

  existingLockManager.lock = Address.fromString(
    '0000000000000000000000000000000000000000'
  ).toHex()
  existingLockManager.address = Address.fromString(
    '0000000000000000000000000000000000000000'
  )
  existingLockManager.save()

  lock.owner = newOwner
  lock.save()
}

export function handlePriceChanged(event: PriceChanged): void {
  let lockAddress = event.address.toHex()
  let lock = Lock.load(lockAddress)
  lock.price = event.params.keyPrice
  lock.save()
}

function newKeyPurchase(
  event: Transfer,
  lock: Lock,
  lockContract: PublicLock
): void {
  let keyID = genKeyID(event.address, event.params._tokenId.toString())
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
    event.params._to,
    event.address,
    event.block.timestamp,
    lock.tokenAddress as Bytes,
    lockContract.keyPrice()
  )
}

function existingKeyTransfer(event: Transfer): void {
  let lockContract = PublicLock.bind(event.address)
  let keyID = genKeyID(event.address, event.params._tokenId.toString())
  let key = Key.load(keyID)

  let keyHolder = loadKeyHolder(event.params._to.toHex())
  keyHolder.save()

  key.owner = event.params._to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params._to)
  key.save()
}

export function handleTransfer(event: Transfer): void {
  let lock = Lock.load(event.address.toHex()) as Lock
  let zeroAddress = Address.fromString(
    '0000000000000000000000000000000000000000'
  ).toHexString()
  let lockContract = PublicLock.bind(event.address)

  // When using === the strings are different.
  // eslint-disable-next-line eqeqeq
  if (event.params._from.toHexString() == zeroAddress) {
    newKeyPurchase(event, lock, lockContract)
  } else {
    existingKeyTransfer(event)
  }
}

export function handleCancelKey(event: CancelKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let key = Key.load(keyID)
  let lockContract = PublicLock.bind(event.address)
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.owner)
  key.save()
}

export function handleExpireKey(event: ExpireKey): void {
  let keyID = genKeyID(event.address, event.params.tokenId.toString())
  let key = Key.load(keyID)
  let lockContract = PublicLock.bind(event.address)
  key.expiration = lockContract.keyExpirationTimestampFor(
    Address.fromString(key.owner)
  )
  key.save()
}
