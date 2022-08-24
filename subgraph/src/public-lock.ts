import { Address, log } from '@graphprotocol/graph-ts'

import {
  CancelKey as CancelKeyEvent,
  ExpirationChanged as ExpirationChangedEvent,
  ExpireKey as ExpireKeyEvent,
  KeyExtended as KeyExtendedEvent,
  KeyManagerChanged as KeyManagerChangedEvent,
  LockManagerAdded as LockManagerAddedEvent,
  LockManagerRemoved as LockManagerRemovedEvent,
  PricingChanged as PricingChangedEvent,
  Transfer as TransferEvent,
} from '../generated/PublicLock/PublicLock'

import { PublicLock } from '../generated/templates/PublicLock/PublicLock'
import { Key, KeyOwner, Lock } from '../generated/schema'

function genKeyID(lockAddress: Address, tokenId: string): string {
  return lockAddress.toHex().concat('-').concat(tokenId)
}

export function handleTransfer(event: TransferEvent): void {
  // create key
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = new Key(keyID)
  key.lock = event.address.toHexString()
  key.tokenId = event.params.tokenId
  key.owner = event.params.to.toHexString()
  key.createdAtBlock = event.block.number

  // Load the lock
  const lockContract = PublicLock.bind(event.address)
  key.tokenURI = lockContract.tokenURI(event.params.tokenId)
  key.expiration = lockContract.keyExpirationTimestampFor(event.params.tokenId)

  // key.manager = Bytes
  key.save()
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
    log.debug('Lock manager {} removed from {}', [
      event.params.account.toHexString(),
      event.address.toHexString(),
    ])
  }
}

export function handleExpirationChanged(event: ExpirationChangedEvent): void {
  const keyID = genKeyID(event.address, event.params._tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    if (event.params._timeAdded) {
      key.expiration = key.expiration.plus(event.params._amount)
    } else {
      key.expiration = key.expiration.minus(event.params._amount)
    }
    key.save()
  }
}

// export function handleCancelKey(event: CancelKeyEvent): void {
//   const entity = new CancelKey(
//     event.transaction.hash.toHex() + '-' + event.logIndex.toString()
//   )
//   entity.tokenId = event.params.tokenId
//   entity.owner = event.params.owner
//   entity.sendTo = event.params.sendTo
//   entity.refund = event.params.refund
//   entity.save()
// }

// export function handleExpireKey(event: ExpireKeyEvent): void {
//   const entity = new ExpireKey(
//     event.transaction.hash.toHex() + '-' + event.logIndex.toString()
//   )
//   entity.tokenId = event.params.tokenId
//   entity.save()
// }

// export function handleKeyExtended(event: KeyExtendedEvent): void {
//   const entity = new KeyExtended(
//     event.transaction.hash.toHex() + '-' + event.logIndex.toString()
//   )
//   entity.tokenId = event.params.tokenId
//   entity.newTimestamp = event.params.newTimestamp
//   entity.save()
// }

// export function handleKeyManagerChanged(event: KeyManagerChangedEvent): void {
//   const entity = new KeyManagerChanged(
//     event.transaction.hash.toHex() + '-' + event.logIndex.toString()
//   )
//   entity._tokenId = event.params._tokenId
//   entity._newManager = event.params._newManager
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
