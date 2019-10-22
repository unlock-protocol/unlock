import utils from '../utils'
import { GAS_AMOUNTS, ZERO } from '../constants'
import TransactionTypes from '../transactionTypes'
import Errors from '../errors'
import { approveTransfer, getErc20Decimals } from '../erc20'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * @return {string} hash of the transaction
 */
export default async function({
  lockAddress,
  owner,
  keyPrice,
  erc20Address,
  decimals,
}) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!erc20Address || erc20Address !== ZERO) {
    erc20Address = await lockContract.tokenAddress()
  }

  // decimals could be 0!
  if (decimals == null) {
    // get the decimals from the ERC20 contract or default to 18
    if (erc20Address && erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    } else {
      decimals = 18
    }
  }

  const actualAmount = utils.toDecimal(keyPrice, decimals)

  const purchaseForOptions = {
    gasLimit: GAS_AMOUNTS.purchaseFor,
  }

  if (erc20Address && erc20Address !== ZERO) {
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

    const hash = await this._handleMethodCall(
      transactionPromise,
      TransactionTypes.KEY_PURCHASE
    )

    // Let's now wait for the transaction to go thru to return the token id
    const receipt = await this.provider.waitForTransaction(hash)
    const parser = lockContract.interface

    const transferEvent = receipt.logs
      .map(log => {
        return parser.parseLog(log)
      })
      .filter(event => {
        return event.name === 'Transfer'
      })[0]
    if (transferEvent) {
      return transferEvent.values._tokenId.toString()
    } else {
      // There was no Transfer log (transaction failed?)
      return null
    }
  } catch (error) {
    this.emit('error', new Error(Errors.FAILED_TO_PURCHASE_KEY))
  }
}
