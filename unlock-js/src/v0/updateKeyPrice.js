import utils from '../utils'
import TransactionTypes from '../transactionTypes'

/**
 * Changes the price of keys on a given lock
 * @param {object} params
 * - {PropTypes.address} lockAddress : address of the lock for which we update the price
 * - {string} keyPrice : new price for the lock, as a string (as wei)
 * @param {function} callback invoked with the transaction hash
 */
export default async function({ lockAddress, keyPrice }, callback) {
  const lockContract = await this.getLockContract(lockAddress)

  const transactionPromise = lockContract.updateKeyPrice(
    utils.toWei(keyPrice, 'ether')
  )

  const hash = await this._handleMethodCall(
    transactionPromise,
    TransactionTypes.UPDATE_KEY_PRICE
  )

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the keyPrice to have been changed before we return it
  const receipt = await this.provider.waitForTransaction(hash)
  const parser = lockContract.interface

  const priceChangedEvent = receipt.logs
    .map(log => {
      return parser.parseLog(log)
    })
    .filter(event => {
      return event.name === 'PriceChanged'
    })[0]
  if (priceChangedEvent) {
    return utils.fromWei(priceChangedEvent.values.keyPrice, 'ether')
  }
  // There was no NewEvent log (transaction failed?)
  return null
}
