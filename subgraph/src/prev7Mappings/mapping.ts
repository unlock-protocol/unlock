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

export function handleLockTransfer(event: OwnershipTransferred): void {
  const lock = Lock.load(event.address.toHex())
  const { newOwner } = event.params
  const { previousOwner } = event.params

  const newLockManagerId = lock.address.toHex().concat(newOwner.toHex())
  let newLockManager = LockManager.load(newLockManagerId)

  if (newLockManager == null) {
    newLockManager = new LockManager(newLockManagerId)
  }

  newLockManager.lock = lock.address.toHex()
  newLockManager.address = newOwner
  newLockManager.save()

  const existingLockManagerId = lock.address
    .toHex()
    .concat(previousOwner.toHex())

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
  const lockAddress = event.address.toHex()
  const lock = Lock.load(lockAddress)
  lock.price = event.params.keyPrice
  lock.save()
}

export function handleTransfer(event: Transfer): void {
  const lock = Lock.load(event.address.toHex()) as Lock
  const zeroAddress = '0x0000000000000000000000000000000000000000'
  const lockContract = PublicLock.bind(event.address)

  if (event.params._from.toHex() == zeroAddress) {
    newKeyPurchase(event, lock, lockContract)
  } else {
    existingKeyTransfer(event)
  }
}

export function handleCancelKey(event: CancelKey): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  const lockContract = PublicLock.bind(event.address)
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.owner)
  key.save()
}

export function handleExpireKey(event: ExpireKey): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  const lockContract = PublicLock.bind(event.address)
  key.expiration = lockContract.keyExpirationTimestampFor(
    Address.fromString(key.owner)
  )
  key.save()
}

function existingKeyTransfer(event: Transfer): void {
  const lockContract = PublicLock.bind(event.address)
  const keyID = genKeyID(event.address, event.params._tokenId.toString())
  const key = Key.load(keyID)

  const keyHolder = loadKeyHolder(event.params._to.toHex())
  keyHolder.save()

  key.owner = event.params._to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params._to)
  key.save()
}

function newKeyPurchase(
  event: Transfer,
  lock: Lock,
  lockContract: PublicLock
): void {
  const keyID = genKeyID(event.address, event.params._tokenId.toString())
  const keyPurchaseID = `${keyID}-${event.block.number.toString()}`

  genKey(event, lockContract)

  const tokenAddress = lockContract.try_tokenAddress()

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

function genKey(event: Transfer, lockContract: PublicLock): void {
  const keyID = genKeyID(event.address, event.params._tokenId.toString())

  newlyMintedKey(event)
  const key = new Key(keyID)
  key.lock = event.address.toHex()
  key.keyId = event.params._tokenId
  key.owner = event.params._to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params._to)
  // key.tokenURI = lockContract.tokenURI(key.keyId);
  key.createdAt = event.block.timestamp

  const lock = Lock.load(key.lock)

  if (lock.version > BigInt.fromI32(0)) {
    const tokenURI = lockContract.try_tokenURI(key.keyId)

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
  const keyPurchase = new KeyPurchase(keyID)
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
  const keyHolder = KeyHolder.load(id)

  if (keyHolder != null) {
    return keyHolder as KeyHolder
  } else {
    const keyHolder = new KeyHolder(id)
    keyHolder.address = Address.fromString(id)
    return keyHolder
  }
}

function newlyMintedKey(event: Transfer): void {
  const keyHolder = loadKeyHolder(event.params._to.toHex())
  keyHolder.save()
}
