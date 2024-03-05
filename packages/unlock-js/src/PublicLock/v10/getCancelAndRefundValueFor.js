import utils from '../../utils'
import { ZERO } from '../../constants'
import { getErc20Decimals } from '../../erc20'

export async function getCancelAndRefundValueFor(
  { lockAddress, tokenAddress, tokenId },
  transactionOptions = {},
  provider
) {
  const lockContract = await this.getLockContract(lockAddress, provider)
  const value = await lockContract.getCancelAndRefundValue(tokenId)

  let refundValue
  if (!tokenAddress || tokenAddress === ZERO) {
    refundValue = utils.fromWei(value, 'ether')
  } else {
    const decimals = await getErc20Decimals(tokenAddress, this.provider)
    refundValue = utils.fromDecimal(value, decimals)
  }

  return refundValue
}

export default getCancelAndRefundValueFor
