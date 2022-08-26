import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  CancelKey as CancelKeyEvent,
  ExpirationChanged as ExpirationChangedEvent,
  ExpireKey as ExpireKeyEvent,
  KeyExtended as KeyExtendedEvent,
  KeyManagerChanged as KeyManagerChangedEvent,
  LockManagerAdded as LockManagerAddedEvent,
  LockManagerRemoved as LockManagerRemovedEvent,
  PricingChanged as PricingChangedEvent,
  RenewKeyPurchase as RenewKeyPurchaseEvent,
  Transfer as TransferEvent,
} from '../generated/templates/PublicLock/PublicLock'

import { PublicLockV11 } from '../generated/templates/PublicLock/PublicLockV11'
import { PublicLockV7 } from '../generated/templates/PublicLock/PublicLockV7'
import { Key, Lock } from '../generated/schema'

function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress.toHex().concat('-').concat(tokenId)
}

function newKey(event: TransferEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = new Key(keyID)
  key.lock = event.address.toHexString()
  key.tokenId = event.params.tokenId
  key.owner = event.params.to.toHexString()
  key.createdAtBlock = event.block.number

  const lockContract = PublicLockV11.bind(event.address)
  key.tokenURI = lockContract.tokenURI(event.params.tokenId)
  key.expiration = keyExpirationTimestampFor(
    event.address,
    event.params.tokenId,
    event.params.to
  )
  key.save()
}

function getVersion(lockAddress: Address): BigInt {
  const lockContract = PublicLockV11.bind(lockAddress)
  const version = lockContract.publicLockVersion()
  return BigInt.fromI32(version)
}

function keyExpirationTimestampFor(
  lockAddress: Address,
  tokenId: BigInt,
  ownerAddress: Address
): BigInt {
  const version = getVersion(lockAddress)
  if (version.ge(BigInt.fromI32(10))) {
    const lockContract = PublicLockV11.bind(lockAddress)
    return lockContract.keyExpirationTimestampFor(tokenId)
  } else {
    const lockContract = PublicLockV7.bind(lockAddress)
    return lockContract.keyExpirationTimestampFor(ownerAddress)
  }
}

export function handleTransfer(event: TransferEvent): void {
  const zeroAddress = '0x0000000000000000000000000000000000000000'
  if (event.params.from.toHex() == zeroAddress) {
    // create key
    newKey(event)
  } else {
    // existing key has been transferred
    const keyID = genKeyID(event.address, event.params.tokenId.toString())
    const key = Key.load(keyID)
    if (key) {
      key.owner = event.params.to.toHexString()
      key.expiration = keyExpirationTimestampFor(
        event.address,
        event.params.tokenId,
        event.params.to
      )
      key.save()
    }
  }
}

export function handleLockManagerAdded(event: LockManagerAddedEvent): void {
  const lock = Lock.load(event.address.toHexString())

  if (lock && lock.lockManagers) {
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
    const lockManagers = lock.lockManagers
    const i = lockManagers.indexOf(event.params.account)
    lockManagers.splice(i)
    lock.lockManagers = lockManagers
    lock.save()
  }
}

export function handleExpirationChanged(event: ExpirationChangedEvent): void {
  const keyID = genKeyID(event.address, event.params._tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    key.expiration = keyExpirationTimestampFor(
      event.address,
      event.params._tokenId,
      Address.fromString(key.owner)
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
    key.cancelled = true
    key.save()
  }
}

// from < v10 (before using tokenId accross the board)
export function handleRenewKeyPurchase(event: RenewKeyPurchaseEvent): void {
  const lockContract = PublicLockV11.bind(event.address)

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

// export function handleKeyExtended(event: KeyExtendedEvent): void {
//   const entity = new KeyExtended(
//     event.transaction.hash.toHex() + '-' + event.logIndex.toString()
//   )
//   entity.tokenId = event.params.tokenId
//   entity.newTimestamp = event.params.newTimestamp
//   entity.save()
// }

// export function handlePricingChanged(event: PricingChangedEvent): void {
//   const entity = new PricingChanged(
//     event.transaction.hash.toHex() + '-' + event.logIndex.toString()
//   )
//   entity.oldKeyPrice = event.params.oldKeyPrice
//   entity.keyPrice = event.params.keyPrice
//   entity.oldTokenAddress = event.params.oldTokenAddress
//   entity.tokenAddress = event.params.tokenAddress
//   entity.save()
// }
