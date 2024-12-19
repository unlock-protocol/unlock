import { ZERO } from '../../constants'
import getPurchaseKeysArguments from './getPurchaseKeysArguments'
import approveAllowance from '../utils/approveAllowance'

/**
 * This function will build a purchase tx based on the params
 * and return from, to, value, data so it can be sent directly
 * via a provider.
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(number)} recurringPayments the number of payments to allow for each keys. If the array is set, the keys are considered using recurring ERRC20 payments).
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * */
export default async function preparePurchase(options, provider) {
  const { lockAddress } = options
  const lockContract = await this.getLockContract(lockAddress, provider)
  options.lockContract = lockContract
  const { purchaseArgs, totalPrice, erc20Address, totalAmountToApprove } =
    await getPurchaseKeysArguments.bind(this)(options)

  const txs = []

  // If the lock is priced in ERC20, we need to approve the transfer
  if (erc20Address != ZERO) {
    const approvalOptions = {
      erc20Address,
      totalAmountToApprove,
      address: lockAddress,
      onlyData: true,
    }

    // Only ask for approval if the lock is priced in ERC20
    if (
      approvalOptions.erc20Address &&
      approvalOptions.erc20Address !== ZERO &&
      totalAmountToApprove > 0
    ) {
      const approvalTxRequest =
        await approveAllowance.bind(this)(approvalOptions)
      if (approvalTxRequest) {
        txs.push(approvalTxRequest)
      }
    }
  }

  // parse using struct
  const callData = lockContract.interface.encodeFunctionData(
    'purchase((uint256,address,address,address,address,bytes,uint256)[])',
    [purchaseArgs.map((p) => Object.values(p))]
  )

  const value = !erc20Address || erc20Address === ZERO ? totalPrice : 0
  const purchaseTxRequest = {
    data: callData,
    value,
    to: lockAddress,
  }
  txs.push(purchaseTxRequest)
  return txs
}
