import utils from '../../utils'
import { ZERO } from '../../constants'
import { getErc20Decimals } from '../../erc20'

export async function getCancelAndRefundValueFor(
  { lockAddress, owner, tokenAddress },
  provider
) {
  const lockContract = await this.getLockContract(lockAddress, provider)
  const value = await lockContract.getCancelAndRefundValueFor(owner)

  let refundValue
  if (tokenAddress === ZERO) {
    refundValue = utils.fromWei(value, 'ether')
  } else {
    refundValue = await getErc20Decimals(tokenAddress, this.provider)
  }

  return refundValue
}

export default getCancelAndRefundValueFor
