import { ZERO } from '../../constants'
import { approveTransfer, getAllowance, prepareApproval } from '../../erc20'
import utils from '../../utils'

export default async function approveAllowance({
  erc20Address,
  address,
  totalAmountToApprove,
  onlyData,
}) {
  if (erc20Address && erc20Address !== ZERO) {
    const approvedAmount = await getAllowance(
      erc20Address,
      address,
      this.provider,
      this.signer ? this.signer.getAddress() : null
    )

    if (
      !approvedAmount ||
      utils.bigNumberify(approvedAmount) < totalAmountToApprove
    ) {
      // get only tx data
      if (onlyData) {
        const data = await prepareApproval(address, totalAmountToApprove)
        return {
          data,
          to: erc20Address,
          value: 0,
        }
      }
      // We must wait for the transaction to pass if we want estimates for the next one to succeed!
      await (
        await approveTransfer(
          erc20Address,
          address,
          totalAmountToApprove,
          this.provider,
          this.signer
        )
      ).wait()
    }
  }
}
