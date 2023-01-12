import utils from '../../utils'
import { ZERO } from '../../constants'
import { getErc20Decimals } from '../../erc20'

export default async function (
  { lockAddress, tokenId, amount = '0', decimals, erc20Address },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  if (!erc20Address || erc20Address !== ZERO) {
    erc20Address = await lockContract.tokenAddress()
  }

  // decimals could be 0!
  if (decimals == null) {
    // get the decimals from the ERC20 contract or default to 18
    if (erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    } else {
      decimals = 18
    }
  }

  const actualAmount = utils.toDecimal(amount, decimals)

  const transactionPromise = lockContract.expireAndRefundFor(
    tokenId,
    actualAmount
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash)
  }

  await this.provider.waitForTransaction(hash)

  return null
}
