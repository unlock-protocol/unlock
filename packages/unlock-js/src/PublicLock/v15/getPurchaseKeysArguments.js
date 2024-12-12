import { MAX_UINT, ZERO } from '../../constants'
import utils from '../../utils'
import formatKeyPrice from '../utils/formatKeyPrice'

export default async function getPurchaseKeysArguments({
  lockContract,
  owners: _owners,
  keyManagers: _keyManagers,
  keyPrices: _keyPrices,
  referrers: _referrers,
  protocolReferrers: _protocolReferrers,
  additionalPeriods: _additionalPeriods,
  lockAddress,
  erc20Address,
  recurringPayments,
  decimals,
  totalApproval, // explicit approval amount
  data: _data,
}) {
  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }

  // owners default to a single key for current signer
  let owners
  if (!_owners || (_owners || []).length === 0) {
    if (this.signer) {
      // owners default to a single key for current signer
      const defaultOwner = await this.signer.getAddress()
      owners = [defaultOwner]
    } else {
      throw Error(
        'Missing recipients. You need to specify explicit key owners when using Web3Service to generate calldata'
      )
    }
  } else {
    owners = _owners
  }

  // we parse by default a length corresponding to the owners length
  const defaultArray = Array(owners.length).fill(null)

  const data = (_data || defaultArray).map((d) => d || '0x')

  const keyPrices = await Promise.all(
    Array.from({ length: owners.length }).map(async (_, index) => {
      const keyPrice = _keyPrices && _keyPrices[index]
      const owner = owners[index]
      let referrer = _referrers && _referrers[index]
      let dataValue = data[index]

      if (!referrer) {
        referrer = ZERO
      }

      if (!dataValue) {
        dataValue = '0x'
      }

      if (!keyPrice) {
        // We might not have the keyPrice, in which case, we need to retrieve from the lock!
        if (owner) {
          return await lockContract.purchasePriceFor(owner, referrer, dataValue)
        } else {
          return await lockContract.keyPrice()
        }
      }
      return formatKeyPrice(keyPrice, erc20Address, decimals, this.provider)
    })
  )
  const keyManagers = (_keyManagers || defaultArray).map((km) => km || ZERO)
  const referrers = (_referrers || defaultArray).map((km) => km || ZERO)
  const protocolReferrers = (_protocolReferrers || defaultArray).map(
    (km) => km || ZERO
  )
  const additionalPeriods = (_additionalPeriods || defaultArray).map(
    (p) => p || 0
  )

  if (
    !(
      keyManagers.length === owners.length &&
      keyPrices.length === owners.length &&
      referrers.length === owners.length &&
      data.length === owners.length &&
      protocolReferrers.length === owners.length &&
      additionalPeriods.length === owners.length
    )
  ) {
    throw new Error(
      'Params mismatch. All purchaseKeys params array should have the same length'
    )
  }

  // calculate total price for all keys
  const totalPrice = keyPrices.reduce((total, kp) => total + kp, BigInt(0))
  let totalAmountToApprove = totalApproval

  if (!totalAmountToApprove) {
    totalAmountToApprove = keyPrices
      .map((keyPrice, i) => {
        if (keyPrice > 0) {
          const recurringPayment = recurringPayments && recurringPayments[i]
          if (!recurringPayment) {
            return keyPrice
          } else if (recurringPayment === Infinity) {
            return MAX_UINT
          } else {
            return keyPrice * BigInt(recurringPayments)
          }
        }
        return BigInt(0)
      })
      .reduce((total, approval) => {
        if (total === MAX_UINT || approval === MAX_UINT) {
          return MAX_UINT
        }
        return total + approval
      }, BigInt(0))
  }

  // parse PurchaseArgs as structs
  const purchaseArgs = owners.map((owner, i) => ({
    value: keyPrices[i],
    recipient: owner,
    referrer: referrers[i],
    protocolReferrer: protocolReferrers[i],
    keyManager: keyManagers[i],
    data: data[i],
    additionalPeriods: additionalPeriods[i],
  }))

  return {
    purchaseArgs,
    totalPrice,
    erc20Address,
    totalAmountToApprove,
  }
}
