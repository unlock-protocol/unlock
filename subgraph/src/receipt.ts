import { BigInt, log, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { ERC20_TRANSFER_TOPIC0, nullAddress } from '../tests/constants'

import { Lock, Receipt } from '../generated/schema'

/**
 * Create Receipt object for subgraph for key 'purchase'/'extend'/'renewal'/'cancel'
 * @param {event} event - Object event
 * @param {BigInt} refund - refund value for cancel
 * @return {void}
 */
export function createReceipt(
  event: ethereum.Event,
  refund: BigInt | null = null
): void {
  const hash = event.transaction.hash.toHexString()

  // Check weather of not the cancel tx is with refund
  if (refund && refund <= BigInt.fromU32(0)) {
    log.debug('Skipping receipt for free (grantKeys or no value) transfer {}', [
      hash,
    ])
    return
  }

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

  // Different logic for receipts
  if (refund) {
    createCancelReceipt(event, tokenAddress, lockAddress, receipt, refund)
  } else {
    createPaymentReceipt(event, tokenAddress, lockAddress, receipt)
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

export function createPaymentReceipt(
  event: ethereum.Event,
  tokenAddress: Bytes,
  lockAddress: string,
  receipt: Receipt
): void {
  if (tokenAddress != Bytes.fromHexString(nullAddress)) {
    log.debug('Creating receipt for ERC20 lock {} {}', [
      lockAddress,
      tokenAddress.toHexString(),
    ])
    const txReceipt = event.receipt!
    const logs: ethereum.Log[] = txReceipt.logs

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
    log.debug('Creating receipt for base currency lock {}', [lockAddress])
    receipt.payer = event.transaction.from.toHexString()
    receipt.amountTransferred = event.transaction.value
  }
}

export function createCancelReceipt(
  event: ethereum.Event,
  tokenAddress: Bytes,
  lockAddress: string,
  receipt: Receipt,
  refund: BigInt
): void {
  if (tokenAddress != Bytes.fromHexString(nullAddress)) {
    log.debug('Creating receipt for ERC20 lock {} {}', [
      lockAddress,
      tokenAddress.toHexString(),
    ])
    const txReceipt = event.receipt!
    const logs: ethereum.Log[] = txReceipt.logs

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
          receipt.payer = ethereum
            .decode('address', txLog.topics[1])!
            .toAddress()
            .toHexString()

          receipt.amountTransferred = refund
        } else {
          log.debug('Not the right kind of transfer!', [])
        }
      }
    }
  } else {
    log.debug('Creating receipt for base currency lock {}', [lockAddress])
    receipt.payer = lockAddress
    receipt.amountTransferred = refund
  }
}
