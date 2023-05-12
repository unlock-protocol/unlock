import { ZERO } from '../../constants'
import { approveTransfer, getAllowance } from '../../erc20'
import utils from '../../utils'

export default async function approveAllowance({
  erc20Address,
  address,
  totalAmountToApprove,
}) {
  if (erc20Address && erc20Address !== ZERO) {
    const approvedAmount = await getAllowance(
      erc20Address,
      address,
      this.provider,
      this.signer.getAddress()
    )

    if (
      !approvedAmount ||
      utils.bigNumberify(approvedAmount).lt(totalAmountToApprove)
    ) {
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
