import utils from '../../utils'
import { ZERO } from '../../constants'
import { getAllowance, approveTransfer } from '../../erc20'
import formatKeyPrice from './formatKeyPrice'

/**
 * Wrapper using the purchase key function to purchase multiple keys
 * This weapper is used prior to lock v11, as `purchase` only allow
 * to buy a single key at a time.
 * This implementation requires the following
 * @parm purchaseKey the purchase key
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
  purchaseKey,
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
  if (!erc20Address) {
    // If erc20Address was not provided, get it
    const lockContract = await this.getLockContract(lockAddress)
    erc20Address = await lockContract.tokenAddress()
    // if ERC20 is set we approve the entire amount
    if (erc20Address !== ZERO) {
      const prices = await Promise.all(
        (keyPrices || Array(owners.length).fill(null)).map(async (kp) =>
          kp
            ? // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
              lockContract.keyPrice()
            : formatKeyPrice(kp, erc20Address, decimals, this.provider)
        )
      )
      // calculate total price for all keys
      const totalPrice = prices.reduce(
        (total, kp) => total.add(kp),
        utils.bigNumberify(0)
      )
      // check what is already approve
      const approvedAmount = await getAllowance(
        erc20Address,
        lockAddress,
        this.provider,
        this.signer
      )
      // approve entire price
      if (!approvedAmount || approvedAmount.lt(totalPrice)) {
        await approveTransfer(
          erc20Address,
          lockAddress,
          totalPrice,
          this.provider,
          this.signer
        )
      }
    }
  }

  return Promise.all(
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
