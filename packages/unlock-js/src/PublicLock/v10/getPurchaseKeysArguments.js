import { ZERO } from '../../constants'
import utils from '../../utils'
import formatKeyPrice from '../utils/formatKeyPrice'

export default async function getPurchaseKeysArguments({
  owners: _owners,
  keyManagers: _keyManagers,
  keyPrices: _keyPrices,
  referrers: _referrers,
  lockAddress,
  erc20Address,
  recurringPayments,
  decimals,
  totalApproval, // explicit approval amount
  data: _data,
}) {
  const lockContract = await this.getLockContract(lockAddress)

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }

  // owners default to a single key for current signer
  const defaultOwner = await this.signer.getAddress()
  const owners = _owners || [defaultOwner]

  // we parse by default a length corresponding to the owners length
  const defaultArray = Array(owners.length).fill(null)

  const keyPrices = await Promise.all(
    (_keyPrices || defaultArray).map(async (kp) => {
      if (!kp) {
        // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
        return await lockContract.keyPrice()
      }
      return formatKeyPrice(kp, erc20Address, decimals, this.provider)
    })
  )
  const keyManagers = (_keyManagers || defaultArray).map((km) => km || ZERO)
  const referrers = (_referrers || defaultArray).map((km) => km || ZERO)
  const data = (_data || defaultArray).map((d) => d || [])

  if (
    !(
      keyManagers.length === owners.length &&
      keyPrices.length === owners.length &&
      referrers.length === owners.length &&
      data.length === owners.length
    )
  ) {
    throw new Error(
      'Params mismatch. All purchaseKeys params array should have the same length'
    )
  }

  // calculate total price for all keys
  const totalPrice = keyPrices.reduce(
    (total, kp) => total.add(kp),
    utils.bigNumberify(0)
  )

  let totalAmountToApprove = totalApproval

  if (!totalAmountToApprove) {
    // total amount to approve
    totalAmountToApprove = recurringPayments
      ? keyPrices // for reccuring payments
          .map((kp, i) => kp.mul(recurringPayments[i]))
          .reduce(
            (total, approval) => total.add(approval),
            utils.bigNumberify(0)
          )
      : totalPrice
  }

  return {
    owners,
    keyPrices,
    keyManagers,
    referrers,
    data,
    totalPrice,
    erc20Address,
    totalAmountToApprove,
  }
}
