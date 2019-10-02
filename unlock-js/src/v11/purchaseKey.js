import utils from '../utils'
import { GAS_AMOUNTS } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'
import { approveTransfer } from '../erc20'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 */
export default async function({
  lockAddress,
  owner,
  keyPrice,
  erc20Address,
  decimals = 18,
}) {
  const lockContract = await this.getLockContract(lockAddress)

  const actualAmount = utils.toDecimal(keyPrice, decimals)

  const purchaseForOptions = {
    gasLimit: GAS_AMOUNTS.purchaseFor,
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
