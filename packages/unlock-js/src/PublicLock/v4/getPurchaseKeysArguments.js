import formatKeyPrice from '../utils/formatKeyPrice'
import utils from '../../utils'

export default async function getPurchaseKeysArguments({
  lockAddress,
  erc20Address,
  decimals,
  owners = [],
  keyManagers = [],
  keyPrices = [],
  referrers = [],
  data = [],
}) {
  // If erc20Address was not provided, get it
  const lockContract = await this.getLockContract(lockAddress)
  erc20Address = await lockContract.tokenAddress()
  // if ERC20 is set we approve the entire amount
  // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
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
  const totalPrice = prices.reduce(
    (total, kp) => total.add(kp),
    utils.bigNumberify(0)
  )

  const items = owners.map((owner, i) => {
    return {
      lockAddress,
      owner,
      keyManager: keyManagers[i],
      keyPrice: keyPrices[i],
      referrer: referrers[i],
      data: data[i],
      erc20Address,
      decimals,
    }
  })
  return {
    items,
    totalPrice,
    erc20Address,
    totalAmountToApprove: totalPrice,
  }
}
