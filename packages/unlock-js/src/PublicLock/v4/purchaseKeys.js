import purchaseKey from './purchaseKey'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  {
    lockAddress,
    erc20Address,
    decimals,
    owners = [],
    keyManagers = [],
    keyPrices = [],
    referrers = [],
    data = [],
  },
  callback
) {
  return await Promise.all(
    owners.map(async (owner, i) =>
      purchaseKey.bind(this)(
        {
          lockAddress,
          owner,
          keyManager: keyManagers[i],
          keyPrice: keyPrices[i],
          referrer: referrers[i],
          data: data[i],
          erc20Address,
          decimals,
        },
        callback
      )
    )
  )
}
