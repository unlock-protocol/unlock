import purchaseKeys from './purchaseKeys'

/**
 * Purchase key function. calls the purchaseKeys function with the vlalue in array
 */
export default async function (
  {
    lockAddress,
    owner,
    keyManager,
    keyPrice,
    erc20Address,
    decimals,
    referrer,
    data,
  },
  callback
) {
  return purchaseKeys(
    {
      owners: [owner],
      keyManagers: [keyManager],
      keyPrices: [keyPrice],
      referrers: [referrer],
      data: [data],
      lockAddress,
      erc20Address,
      decimals,
    },
    callback
  )
}
