import purchaseKey from './purchaseKey'

/**
 * Purchase key function. This implementation requires the following
 * @param {PropTypes.arrayOf(object)} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.address} referrer (address which will receive UDT - if applicable)
 * - {PropTypes.array[bytes]} data (array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 */
 export default async function ({ params, callback }) {
  await Promise.all(params.map(async (param) => purchaseKey(param, callback)))
}