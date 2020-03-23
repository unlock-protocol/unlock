import utils from '../utils'
import { GAS_AMOUNTS, ZERO } from '../constants'
import TransactionTypes from '../transactionTypes'
import { approveTransfer, getErc20Decimals, getAllowance } from '../erc20'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * @param {function} callback invoked with the transaction hash
 */
export default async function(
  { lockAddress, owner, keyPrice, erc20Address, decimals },
  callback
) {
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
    const approvedAmount = await getAllowance(
      erc20Address,
      lockAddress,
      this.provider
    )
    if (approvedAmount < actualAmount) {
      await approveTransfer(
        erc20Address,
        lockAddress,
        actualAmount,
        this.provider
      )
    }
  } else {
    purchaseForOptions.value = actualAmount
  }

  const transactionPromise = lockContract['purchaseFor(address)'](
    owner,
    purchaseForOptions
  )

  const hash = await this._handleMethodCall(
    transactionPromise,
    TransactionTypes.KEY_PURCHASE
  )

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = lockContract.interface

  const transferEvent = receipt.logs
    .map(log => {
      if (log.address !== lockAddress) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter(event => {
      return event && event.name === 'Transfer'
    })[0]

  if (transferEvent) {
    return transferEvent.values._tokenId.toString()
  }
  // There was no Transfer log (transaction failed?)
  return null
}
