import { BigInt, log, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { nullAddress } from '../tests/constants'

import { Lock, Receipt } from '../generated/schema'

/**
 * Create Receipt object for subgraph for key 'purchase'/'extend'/'renewal'
 * @param {String} keyID - key id
 * @param {event} Object - Object event
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

  // TODO: compile from contract ABI
  // WARNING : For some tokens it may be different. In that case we would move to a list!
  // TODO: for easier handling on future locks: trigger an "paid" event with the amount and data needed?
  const ERC20_TRANSFER_TOPIC0 =
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

  if (tokenAddress != Bytes.fromHexString(nullAddress)) {
    log.debug('Creating receipt for ERC20 lock {} {}', [
      lockAddress,
      tokenAddress.toString(),
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
          // Do we always have txLog.topics[0] ?
          txLog.topics[0].toHexString() == ERC20_TRANSFER_TOPIC0 &&
          txLog.topics[2].toHexString() == lockAddress
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
      // If no ERC20 transfer event was found, this was not a "paid" transaction,
      // which means we don't need to create a receipt.
    }
  } else {
    log.debug('Creating receipt for base currency lock {}', [lockAddress])
    receipt.payer = event.transaction.from.toHexString()
    receipt.amountTransferred = event.transaction.value
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
