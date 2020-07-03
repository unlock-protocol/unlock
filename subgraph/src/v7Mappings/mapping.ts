import { Address, Bytes, BigInt } from '@graphprotocol/graph-ts'
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
} from '../../generated/templates/PublicLock7/PublicLock'

export function cancelKey(event: CancelKey): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  const lockContract = PublicLock.bind(event.address)
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.owner)
  key.save()
}

export function expirationChanged(event: ExpirationChanged): void {
  const keyID = genKeyID(event.address, event.params._tokenId.toString())
  const key = Key.load(keyID)
  const lockContract = PublicLock.bind(event.address)
  const lockOwner = lockContract.ownerOf(event.params._tokenId)
  const currentExpiration = lockContract.keyExpirationTimestampFor(lockOwner)

  const timeDelta = event.params._amount

  if (event.params._timeAdded) {
    key.expiration = currentExpiration.plus(timeDelta)
  } else {
    key.expiration = currentExpiration.minus(timeDelta)
  }

  key.save()
}

export function expireKey(event: ExpireKey): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)

  key.expiration = event.block.timestamp

  key.save()
}

export function lockManagerAdded(event: LockManagerAdded): void {
  const lockAddress = event.address.toHex()
  const manager = event.params.account.toHex()

  const lockManager = new LockManager(lockAddress.concat(manager))
  lockManager.lock = lockAddress
  lockManager.address = event.params.account
  lockManager.save()
}

export function lockManagerRemoved(event: LockManagerRemoved): void {
  const lockAddress = event.address.toHex()
  const manager = event.params.account.toHex()

  const lockManager = new LockManager(lockAddress.concat(manager))
  lockManager.lock = Address.fromI32(0).toHex()
  lockManager.save()
}

export function pricingChanged(event: PricingChanged): void {
  const lockAddress = event.address.toHex()
  const lock = Lock.load(lockAddress)
  lock.price = event.params.keyPrice
  lock.tokenAddress = event.params.tokenAddress
  lock.save()
}

export function transfer(event: Transfer): void {
  const lock = Lock.load(event.address.toHex()) as Lock
  const zeroAddress = '0x0000000000000000000000000000000000000000'
  const lockContract = PublicLock.bind(event.address)

  if (event.params.from.toHex() == zeroAddress) {
    newKeyPurchase(event, lock, lockContract)
  } else {
    existingKeyTransfer(event)
  }
}

function newKeyPurchase(
  event: Transfer,
  lock: Lock,
  lockContract: PublicLock
): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
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
    event.params.to,
    event.address,
    event.block.timestamp,
    lock.tokenAddress as Bytes,
    lockContract.keyPrice()
  )
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

function newlyMintedKey(event: Transfer): void {
  const keyHolder = loadKeyHolder(event.params.to.toHex())
  keyHolder.save()
}

function genKey(event: Transfer, lockContract: PublicLock): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())

  newlyMintedKey(event)
  const key = new Key(keyID)
  key.lock = event.address.toHex()
  key.keyId = event.params.tokenId
  key.owner = event.params.to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.to)
  key.tokenURI = lockContract.tokenURI(key.keyId)
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

function existingKeyTransfer(event: Transfer): void {
  const lockContract = PublicLock.bind(event.address)
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)

  const keyHolder = loadKeyHolder(event.params.to.toHex())
  keyHolder.save()

  key.owner = event.params.to.toHex()
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.to)
  key.save()
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

function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress.toHex().concat('-').concat(tokenId)
}
