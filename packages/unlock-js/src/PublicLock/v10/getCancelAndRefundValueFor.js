import utils from '../../utils'
import { ZERO } from '../../constants'
import { getErc20Decimals } from '../../erc20'

export async function getCancelAndRefundValueFor({
  lockAddress,
  tokenAddress,
  tokenId,
}) {
  const lockContract = await this.getLockContract(lockAddress)
  const value = await lockContract.getCancelAndRefundValue(tokenId)

  let refundValue
  if (tokenAddress === ZERO) {
    refundValue = utils.fromWei(value, 'ether')
  } else {
    refundValue = await getErc20Decimals(tokenAddress, this.provider)
  }

  return refundValue
}

export default getCancelAndRefundValueFor
