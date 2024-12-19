import { ZERO } from '../../constants'
import formatKeyPrice from '../utils/formatKeyPrice'
import approveAllowance from '../utils/approveAllowance'

/**
 * Build tx for purchasing a single key
 * @returns {object}
 * - {PropTypes.address} to
 * - {PropTypes.number} value
 * - {PropTypes.bytes} data
 */
export default async function (
  {
    lockAddress,
    owner,
    keyManager,
    keyPrice,
    erc20Address,
    decimals,
    referrer,
    data,
    skipAllowance, // used to parse allowance externally during multiple purchase on v9
  },
  provider
) {
  const lockContract = await this.getLockContract(lockAddress, provider)

  const txs = []

  if (!owner) {
    owner = await this.signer.getAddress()
  }

  if (!referrer) {
    referrer = ZERO
  }

  if (!keyManager) {
    keyManager = ZERO
  }

  if (!data) {
    data = '0x'
  }

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }
  let actualAmount
  if (!keyPrice) {
    // We might not have the keyPrice, in which case, we need to retrieve from the lock!
    actualAmount = await lockContract.keyPrice()
  } else {
    actualAmount = await formatKeyPrice(
      keyPrice,
      erc20Address,
      decimals,
      this.provider
    )
  }
  // If the lock is priced in ERC20, we need to approve the transfer
  if (erc20Address != ZERO && !skipAllowance) {
    const totalAmountToApprove = actualAmount
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
  // parse
  const purchaseArgs = [actualAmount, owner, referrer, keyManager, data]
  const callData = lockContract.interface.encodeFunctionData(
    'purchase',
    purchaseArgs
  )

  const value = !erc20Address || erc20Address === ZERO ? actualAmount : 0
  const purchaseTxRequest = {
    data: callData,
    value,
    to: lockAddress,
  }
  txs.push(purchaseTxRequest)
  return txs
}
