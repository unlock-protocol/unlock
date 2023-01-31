import { Address, BigInt, log, Bytes, ethereum } from '@graphprotocol/graph-ts'
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
import { Key, Lock, UnlockStats, LockStats, Receipt } from '../generated/schema'

import {
  genKeyID,
  getKeyExpirationTimestampFor,
  loadOrCreateUnlockDailyData,
  LOCK_MANAGER,
} from './helpers'

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

  const hash = event.transaction.hash.toHexString()
  const transactionsHash = key.transactionsHash
  // add transaction hash for new key event
  if (transactionsHash && transactionsHash.length) {
    if (!transactionsHash.includes(hash)) {
      transactionsHash.push(hash)
    }
  } else {
    key.transactionsHash = [hash]
  }

  key.save()

  // create receipt
  createReceipt(event)

  // update lock
  const lock = Lock.load(event.address.toHexString())
  if (lock) {
    lock.totalKeys = lock.totalKeys.plus(BigInt.fromI32(1))
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
    createReceipt(event)
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

      const hash = event.transaction.hash.toHexString()
      const transactionsHash = key.transactionsHash
      // add transaction hash for transfer event
      if (transactionsHash && transactionsHash.length) {
        if (!transactionsHash.includes(hash)) {
          transactionsHash.push(hash)
        }
      } else {
        key.transactionsHash = [hash]
      }
      key.save()
    }
    createReceipt(event)
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
    key.cancelled = true
    key.save()
  }
}

export function handleKeyExtended(event: KeyExtendedEvent): void {
  const keyID = genKeyID(event.address, event.params.tokenId.toString())
  const key = Key.load(keyID)
  if (key) {
    const hash = event.transaction.hash.toHexString()
    const transactionsHash = key.transactionsHash
    // add transaction hash for extend event
    if (transactionsHash && transactionsHash.length) {
      if (!transactionsHash.includes(hash)) {
        transactionsHash.push(hash)
      }
    } else {
      key.transactionsHash = [hash]
    }
    key.expiration = event.params.newTimestamp
    key.cancelled = false
    key.save()
  }
  // create receipt
  createReceipt(event)
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
    const hash = event.transaction.hash.toHexString()
    const transactionsHash = key.transactionsHash
    // add transaction hash for renew event
    if (transactionsHash && transactionsHash.length) {
      if (!transactionsHash.includes(hash)) {
        transactionsHash.push(hash)
      }
    } else {
      key.transactionsHash = [hash]
    }
    key.expiration = event.params.newExpiration
    key.cancelled = false
    key.save()
  }

  // create receipt
  createReceipt(event)
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
      if (lockManagers && lockManagers.length) {
        if (!lockManagers.includes(event.params.account)) {
          lockManagers.push(event.params.account)
          lock.lockManagers = lockManagers
        }
      } else {
        lock.lockManagers = [event.params.account]
      }
      lock.save()
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

/**
 * Create Receipt object for subgraph for key 'purchase'/'extend'/'renewal'
 * @param {String} keyID - key id
 * @param {event} Object - Object event
 * @return {void}
 */
export function createReceipt(event: ethereum.Event): void {
  const lockAddress = event.address.toHexString()
  const hash = event.transaction.hash.toHexString()

  const receipt = new Receipt(hash)

  const lock = Lock.load(lockAddress)

  const tokenAddress =
    lock && lock.tokenAddress ? lock.tokenAddress : Bytes.fromHexString('')

  // TODO: compile from contract ABI
  // WARNING : For some tokens it may be different. In that case we would move to a list!
  const ERC20_TRANSFER_TOPIC0 =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

  if (lock && tokenAddress.toString().length > 0) {
    const txReceipt = event.receipt!
    const logs: ethereum.Log[] = txReceipt.logs
    if (logs) {
      // If it is an ERC20 lock, there should be multiple events
      // including one for the ERC20 transfer
      for (let i = 0; i < logs.length; i++) {
        const txLog = logs[i]
        if (
          txLog.address == tokenAddress &&
          // Do we always have txLog.topics[0] ?
          txLog.topics[0].toHexString() == ERC20_TRANSFER_TOPIC0
        ) {
          receipt.payer = ethereum
            .decode('address', txLog.topics[1])!
            .toAddress()
            .toHexString()

          receipt.amountTransferred = ethereum
            .decode('uint256', txLog.data)!
            .toBigInt()
        }
      }
    }
  } else {
    receipt.payer = event.transaction.from.toHexString()
    receipt.amountTransferred = event.transaction.value
  }

  const totalGas = event.transaction.gasPrice.plus(event.transaction.gasLimit)

  receipt.lockAddress = lockAddress
  receipt.timestamp = event.block.timestamp
  receipt.sender = event.transaction.from.toHexString()
  receipt.tokenAddress = tokenAddress.toHexString()
  receipt.gasTotal = BigInt.fromString(totalGas.toString())
  receipt.save()
}
