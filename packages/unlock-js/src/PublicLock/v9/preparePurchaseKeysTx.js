import { ZERO } from '../../constants'
import approveAllowance from '../utils/approveAllowance'
import preparePurchaseKey from './preparePurchaseKeyTx'
import formatKeyPrice from '../utils/formatKeyPrice'

/**
 * This function will build a purchase tx based on the params
 * and return from, to, value, data so it can be sent directly
 * via a provider.
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(number)} recurringPayments the number of payments to allow for each keys. If the array is set, the keys are considered using recurring ERRC20 payments).
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * */
export default async function preparePurchaseKeys(
  {
    lockAddress,
    erc20Address,
    decimals,
    owners = [],
    keyManagers = [],
    keyPrices = [],
    referrers = [],
    data = ['0x'],
  },
  provider
) {
  const lockContract = await this.getLockContract(lockAddress, provider)

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }

  // We might not have the keyPrice, in which case, we need to retrieve from the lock!
  const getPrice = async (price) =>
    !price
      ? await lockContract.keyPrice()
      : await formatKeyPrice(price, erc20Address, decimals, this.provider)

  const prices = await Promise.all(
    (keyPrices.length === owners.length
      ? keyPrices
      : Array(owners.length).fill(null)
    ).map((kp) => getPrice(kp))
  )

  // calculate total price for all keys
  const totalPrice = prices.reduce((total, kp) => total + kp, BigInt(0))

  let approvalTxRequest
  // if ERC20 is set we approve the entire amount
  if (erc20Address !== ZERO) {
    const totalAmountToApprove = totalPrice
    const approvalOptions = {
      erc20Address,
      totalAmountToApprove,
      address: lockAddress,
      onlyData: true,
    }
    // Only ask for approval if the lock is priced in ERC20
    if (
      approvalOptions.erc20Address &&
      approvalOptions.erc20Address !== ZERO &&
      totalAmountToApprove > 0
    ) {
      approvalTxRequest = await approveAllowance.bind(this)(approvalOptions)
    }
  }

  const txPurchases = await Promise.all(
    owners.map(async (owner, i) =>
      preparePurchaseKey.bind(this)(
        {
          lockAddress,
          owner,
          keyManager: keyManagers[i],
          keyPrice: keyPrices[i],
          referrer: referrers[i],
          data: data[i],
          erc20Address,
          decimals: decimals,
          skipAllowance: true,
        },
        provider
      )
    )
  )

  // return approval tx only if set
  return approvalTxRequest
    ? [approvalTxRequest, ...txPurchases.flat()]
    : txPurchases.flat()
}
