import purchaseKeys from './purchaseKeys'

/**
 * Purchase key function. calls the purchaseKeys function with the value in array
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
    recurringPayments, // nb of reccuring payments to approve
    data,
  },
  transactionOptions = {},
  callback
) {
  const keys = await purchaseKeys.bind(this)(
    {
      owners: owner ? [owner] : null,
      keyManagers: keyManager ? [keyManager] : null,
      keyPrices: keyPrice ? [keyPrice] : null,
      referrers: referrer ? [referrer] : null,
      data: data ? [data] : null,
      recurringPayments: recurringPayments ? [recurringPayments] : null,
      lockAddress,
      erc20Address,
      decimals,
    },
    (transactionOptions = {}),
    callback
  )
  return keys[0] // Only a single key!
}
