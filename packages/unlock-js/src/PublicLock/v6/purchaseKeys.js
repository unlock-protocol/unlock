import purchaseKey from './purchaseKey'

/**
 * Purchase key function. This implementation requires the following
 * @param {PropTypes.arrayOf(object)} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * @param {function} callback invoked with each transaction hash
 */

export default async function ({ params, callback }) {
  await Promise.all(params.map(async (param) => purchaseKey(param, callback)))
}
