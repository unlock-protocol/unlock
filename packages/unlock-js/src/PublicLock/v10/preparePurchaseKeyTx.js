import preparePurchaseKeysTx from './preparePurchaseKeysTx'

/**
 * Build tx for purchasing a single key
 * @returns {object}
 * - {PropTypes.address} to
 * - {PropTypes.number} value
 * - {PropTypes.bytes} data
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
    recurringPayments, // nb of reccuring payments to approve,
    totalApproval, // Explicit approval amount
    data,
  },
  provider
) {
  const txs = await preparePurchaseKeysTx.bind(this)(
    {
      owners: owner ? [owner] : null,
      keyManagers: keyManager ? [keyManager] : null,
      keyPrices: keyPrice ? [keyPrice] : null,
      referrers: referrer ? [referrer] : null,
      data: data ? [data] : null,
      recurringPayments: recurringPayments ? [recurringPayments] : null,
      lockAddress,
      erc20Address,
      totalApproval,
      decimals,
    },
    provider
  )
  return txs
}
