import utils from '../../utils'
import { ZERO } from '../../constants'
import { approveTransfer, getAllowance } from '../../erc20'
import formatKeyPrice from '../utils/formatKeyPrice'

/**
 * Function to renew a membership, callable by anyone.
 * This is only useful for ERC20 locks for which the key owner has approved
 * a large enough token amount!
 * @param params
 * @param callback
 * @returns
 */
export default async function (
  { lockAddress, referrer, tokenId },
  purchaseForOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!referrer) {
    referrer = ZERO
  }

  // Estimate gas. Bump by 30% because estimates are wrong!
  if (!purchaseForOptions?.gasLimit) {
    try {
      const gasLimit = await lockContract.estimateGas.renewMembershipFor(
        tokenId,
        referrer,
        purchaseForOptions
      )
      purchaseForOptions.gasLimit = gasLimit.mul(13).div(10).toNumber()
    } catch (error) {
      console.error(
        'We could not estimate gas ourselves. Let wallet do it.',
        error
      )
    }
  }

  const transactionPromise = lockContract.renewMembershipFor(
    tokenId,
    referrer,
    purchaseForOptions
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  const receipt = await this.provider.waitForTransaction(hash)

  if (receipt.status === 0) {
    throw new Error('Transaction failed')
  }

  return tokenId
}
