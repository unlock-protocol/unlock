import { BigInt, log, Bytes, ethereum, Address } from '@graphprotocol/graph-ts'
import {
  GNP_CHANGED_TOPIC0,
  ERC20_TRANSFER_TOPIC0,
  nullAddress,
} from '../tests/constants'
import { PublicLockV11 as PublicLock } from '../generated/templates/PublicLock/PublicLockV11'

import { Lock, Receipt } from '../generated/schema'

/**
 * Create Receipt object for subgraph for key 'purchase'/'extend'/'renewal'/'
 * @param {event} event - Object event
 * @return {void}
 */
export function createReceipt(event: ethereum.Event): void {
  const hash = event.transaction.hash.toHexString()

  log.debug('Creating receipt for transaction {}', [hash])

  // Lock address is always the address of the contract emitting the `Transfer` event
  const lockAddress = event.address.toHexString()

  // Instantiate the receipt object
  const receipt = new Receipt(hash)
  receipt.amountTransferred = BigInt.fromI32(0) // default value

  const lock = Lock.load(lockAddress)

  // No need to go further if there is no matching lock object in the subgraph
  if (!lock) {
    log.debug('Missing Lock {}. Skipping receipt', [lockAddress])
    return
  }

  const tokenAddress = lock.tokenAddress
    ? lock.tokenAddress
    : Bytes.fromHexString(nullAddress)

  const txReceipt = event.receipt!
  const logs: ethereum.Log[] = txReceipt.logs

  if (tokenAddress != Bytes.fromHexString(nullAddress)) {
    log.debug('Creating receipt for ERC20 lock {} {}', [
      lockAddress,
      tokenAddress.toHexString(),
    ])

    if (logs) {
      // If it is an ERC20 lock, there should be multiple events
      // including one for the ERC20 transfer
      for (let i = 0; i < logs.length; i++) {
        const txLog = logs[i]

        if (
          txLog.address == tokenAddress &&
          txLog.topics[0].toHexString() == ERC20_TRANSFER_TOPIC0 &&
          txLog.topics.length >= 3
        ) {
          const erc20Recipient = ethereum
            .decode('address', txLog.topics[2])!
            .toAddress()

          // If the ERC20 recipient is the lock, then this is the transfer we're looking for!
          if (erc20Recipient == event.address) {
            receipt.payer = ethereum
              .decode('address', txLog.topics[1])!
              .toAddress()
              .toHexString()

            receipt.amountTransferred = ethereum
              .decode('uint256', txLog.data)!
              .toBigInt()
          } else {
            log.debug('Not the transfer to the lock!', [])
          }
        } else {
          log.debug('Not the right kind of transfer!', [])
        }
      }
      // If no ERC20 transfer event was found, this was not a "paid" transaction,
      // which means we don't need to create a receipt.
    }
  } else {
    log.debug('Creating receipt for native currency lock {}', [lockAddress])
    receipt.payer = event.transaction.from.toHexString()
    receipt.amountTransferred = event.transaction.value
    // We cannot trust `event.transaction.value` because the purchase function could in fact
    // be happening inside of a larger transaction whose value is not the amount transfered,
    // In that case, we need to look up the GNPChanged event
    // This is a very fragile setup and we should consider moving to a more formal event triggered
    // by the contract, like a `Receipt` event that would include everything we need.
    if (logs) {
      const lockContract = PublicLock.bind(Address.fromString(lockAddress))
      const unlockAddress = lockContract.try_unlockProtocol()
      let value = BigInt.zero()
      for (let i = 0; i < logs.length; i++) {
        const txLog = logs[i]
        if (
          txLog.address == unlockAddress.value &&
          txLog.topics[0].toHexString() == GNP_CHANGED_TOPIC0
        ) {
          const decoded = ethereum
            .decode('(uint256,uint256,address,uint256,address)', txLog.data)!
            .toTuple()

          const keyValue = decoded[1].toBigInt()
          value = value.plus(keyValue)
        }
      }
      if (value > BigInt.zero()) {
        receipt.amountTransferred = value
      }
    }
  }

  const totalGas = event.transaction.gasPrice.plus(event.transaction.gasLimit)
  receipt.lockAddress = lockAddress
  receipt.recipient = lockAddress
  receipt.timestamp = event.block.timestamp
  receipt.sender = event.transaction.from.toHexString()
  receipt.tokenAddress = lock.tokenAddress.toHexString()
  receipt.gasTotal = BigInt.fromString(totalGas.toString())

  // save receipt, but only if we have a payer
  // (i.e. this is a paid transaction)
  if (receipt.payer !== null && receipt.amountTransferred > BigInt.fromI32(0)) {
    // Updating the lock object
    const newReceiptNumber = lock.numberOfReceipts.plus(BigInt.fromI32(1))
    lock.numberOfReceipts = newReceiptNumber
    lock.save()

    receipt.receiptNumber = newReceiptNumber
    receipt.save()
  } else {
    log.debug('Skipping receipt for free (grantKeys or no value) transfer {}', [
      hash,
    ])
  }
}

/**
 * Create Receipt object for subgraph for key 'cancel'/'expire and refund'/'
 * @param {event} event - Object event
 * @return {boolean} - Weather or not the receipt was created
 */
export function tryCreateCancelReceipt(event: ethereum.Event): boolean {
  const hash = event.transaction.hash.toHexString()

  log.debug('Creating receipt for transaction {}', [hash])

  // Lock address is always the address of the contract emitting the `Transfer` event
  const lockAddress = event.address.toHexString()

  // Instantiate the receipt object
  const receipt = new Receipt(hash)
  receipt.amountTransferred = BigInt.fromI32(0) // default value

  const lock = Lock.load(lockAddress)

  // No need to go further if there is no matching lock object in the subgraph
  if (!lock) {
    log.debug('Missing Lock {}. Skipping receipt', [lockAddress])
    return false
  }

  const tokenAddress = lock.tokenAddress
    ? lock.tokenAddress
    : Bytes.fromHexString(nullAddress)

  const txReceipt = event.receipt!
  const logs: ethereum.Log[] = txReceipt.logs

  if (logs) {
    // If it is an ERC20 lock, there should be multiple events
    // including one for the ERC20 transfer
    // for base currency lock there should be one event named
    // CancelKey
    for (let i = 0; i < logs.length; i++) {
      const txLog = logs[i]

      if (
        txLog.address == tokenAddress &&
        txLog.topics[0].toHexString() == ERC20_TRANSFER_TOPIC0 &&
        txLog.topics.length >= 3
      ) {
        log.debug('Creating receipt for ERC20 lock {} {}', [
          lockAddress,
          tokenAddress.toHexString(),
        ])

        receipt.payer = ethereum
          .decode('address', txLog.topics[1])!
          .toAddress()
          .toHexString()

        receipt.recipient = ethereum
          .decode('address', txLog.topics[2])!
          .toAddress()
          .toHexString()

        // EVM data is big-endian so need to reverse txLog data from subgraph
        receipt.amountTransferred = BigInt.fromUnsignedBytes(
          Bytes.fromUint8Array(txLog.data.reverse())
        )
      } else if (
        tokenAddress == Bytes.fromHexString(nullAddress) &&
        txLog.address.toHexString() == lockAddress &&
        txLog.topics.length >= 4
      ) {
        log.debug('Creating receipt for base currency lock {}', [lockAddress])
        receipt.payer = lockAddress

        receipt.recipient = ethereum
          .decode('address', txLog.topics[2])!
          .toAddress()
          .toHexString()

        // EVM data is big-endian so need to reverse txLog data from subgraph
        receipt.amountTransferred = BigInt.fromUnsignedBytes(
          Bytes.fromUint8Array(txLog.data.reverse())
        )
      } else {
        log.debug('Not the right kind of transfer!', [])
      }
    }
  }

  const totalGas = event.transaction.gasPrice.plus(event.transaction.gasLimit)
  receipt.lockAddress = lockAddress
  receipt.timestamp = event.block.timestamp
  receipt.sender = event.transaction.from.toHexString()
  receipt.tokenAddress = lock.tokenAddress.toHexString()
  receipt.gasTotal = BigInt.fromString(totalGas.toString())

  // save receipt, but only if we have a payer
  // (i.e. this is a paid transaction)
  if (receipt.payer !== null && receipt.amountTransferred > BigInt.fromI32(0)) {
    // Updating the lock object
    const newReceiptNumber = lock.numberOfCancelReceipts.plus(BigInt.fromI32(1))
    lock.numberOfCancelReceipts = newReceiptNumber
    lock.save()

    receipt.receiptNumber = newReceiptNumber
    receipt.save()

    return true
  } else {
    log.debug('Skipping receipt for free (grantKeys or no value) transfer {}', [
      hash,
    ])
    return false
  }
}
