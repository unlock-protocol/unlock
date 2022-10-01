import utils from '../../utils'
import { ZERO } from '../../constants'
import { getErc20Decimals } from '../../erc20'

/**
 * Changes the price of keys on a given lock
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the price
 * - {string} keyPrice : new price for the lock, as a string (as wei)
 * - {string} decimals : Optional number of decimals (read from contract if unset)
 * - {string} erc20Address : Optional address of ERC20, to retrieve decimals (read from contract if unset)
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, keyPrice, decimals, erc20Address },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (decimals == null) {
    // Get the decimals address from the contract
    if (!erc20Address) {
      erc20Address = await lockContract.tokenAddress()
    }

    if (erc20Address && erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    } else {
      decimals = 18
    }
  }
  const actualAmount = utils.toDecimal(keyPrice, decimals)

  const transactionPromise =
    lockContract['updateKeyPrice(uint256)'](actualAmount)
  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the keyPrice to have been changed before we return it
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = lockContract.interface

  const priceChangedEvent = receipt.logs
    .map((log) => {
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event.signature === 'PriceChanged(uint256,uint256)'
    })[0]
  if (priceChangedEvent) {
    return utils.fromDecimal(priceChangedEvent.args.keyPrice, decimals)
  }
  // There was no NewEvent log (transaction failed?)
  return null
}
