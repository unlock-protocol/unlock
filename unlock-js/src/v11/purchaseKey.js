import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'
import { approveTransfer } from '../erc20'

/**
 * Purchase a key to a lock by account.
 * The key object is passed so we can kepe track of it from the application
 * The lock object is required to get the price data
 * We pass both the owner and the account because at some point, these may be different (someone
 * purchases a key for someone else)
 * @param {PropTypes.address} lock
 * @param {PropTypes.address} owner
 * @param {string} keyPrice
 * @param {string} data
 * @param {string} account
 */
export default async function(
  lockAddress,
  owner,
  keyPrice,
  account,
  data,
  erc20Address,
  decimals = 18
) {
  const lockContract = await this.getLockContract(lockAddress)

  const actualAmount = utils.toDecimal(keyPrice, decimals)

  const purchaseForOptions = {
    gasLimit: GAS_AMOUNTS.purchaseFor, // overrides default value for transaction gas price
  }

  if (erc20Address) {
    await approveTransfer(
      erc20Address,
      lockAddress,
      actualAmount,
      this.provider
    )
  } else {
    purchaseForOptions.value = actualAmount
  }

  let transactionPromise
  try {
    transactionPromise = lockContract['purchaseFor(address)'](
      owner,
      purchaseForOptions
    )
    const ret = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.KEY_PURCHASE
    )
    return ret
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_PURCHASE_KEY))
  }
}
