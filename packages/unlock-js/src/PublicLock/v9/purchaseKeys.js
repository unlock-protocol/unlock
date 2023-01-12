import multiplePurchaseWrapper from '../utils/multiplePurchaseWrapper'
import purchaseKey from './purchaseKey'

/**
 * Purchase key function. This implementation requires the followin
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 * */

export default async function (params, transactionOptions = {}, callback) {
  return await multiplePurchaseWrapper.bind(this)(
    purchaseKey,
    params,
    transactionOptions,
    callback
  )
}
