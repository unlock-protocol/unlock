import utils from '../utils'
import { GAS_AMOUNTS, ZERO } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'
import { getErc20Decimals } from '../erc20'

/**
 * Changes the price of keys on a given lock
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the price
 * - {string} keyPrice : new price for the lock, as a string (as wei)
 * - {string} decimals : Optional number of decimals (read from contract if unset)
 * - {string} erc20Address : Optional address of ERC20, to retrieve decimals (read from contract if unset)
 */
export default async function({
  lockAddress,
  keyPrice,
  decimals,
  erc20Address,
}) {
  const lockContract = await this.getLockContract(lockAddress)

  if (decimals == null) {
    // Get the decimals address from the contract
    if (!erc20Address || erc20Address !== ZERO) {
      erc20Address = await lockContract.tokenAddress()
    }

    if (erc20Address && erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    } else {
      decimals = 18
    }
  }

  const actualAmount = utils.toDecimal(keyPrice, decimals)

  let transactionPromise
  try {
    transactionPromise = lockContract['updateKeyPrice(uint256)'](actualAmount, {
      gasLimit: GAS_AMOUNTS.updateKeyPrice,
    })
    const ret = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.UPDATE_KEY_PRICE
    )
    return ret
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_UPDATE_KEY_PRICE))
  }
}
