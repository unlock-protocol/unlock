import utils from '../../utils'
import { ZERO } from '../../constants'
import { getErc20Decimals } from '../../erc20'
import approveAllowance from '../utils/approveAllowance'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {PropTypes.address} owner
 * - {string} keyPrice
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  { lockAddress, owner, keyPrice, erc20Address, decimals, swap },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)
  const unlockSwapPurchaserContract = swap
    ? this.getUnlockSwapPurchaserContract({
        params: this.networkId,
      })
    : null

  if (!owner) {
    owner = await this.signer.getAddress()
  }
  if (!erc20Address || erc20Address !== ZERO) {
    erc20Address = await lockContract.tokenAddress()
  }
  let actualAmount

  // decimals could be 0!
  if (!keyPrice) {
    // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
    actualAmount = await lockContract.keyPrice()
  } else if (decimals == null) {
    // get the decimals from the ERC20 contract or default to 18
    if (erc20Address && erc20Address !== ZERO) {
      decimals = await getErc20Decimals(erc20Address, this.provider)
    } else {
      decimals = 18
    }
    actualAmount = utils.toDecimal(keyPrice, decimals)
  }

  const callData = lockContract.interface.encodeFunctionData('purchaseFor', [
    owner,
  ])

  // tx options
  if (!erc20Address || erc20Address === ZERO) {
    transactionOptions.value = actualAmount
  }

  // if swap is provided, we need to override the value
  if (swap && swap.value) {
    transactionOptions.value = swap.value
  }

  // If the lock is priced in ERC20, we need to approve the transfer
  const approvalOptions = swap
    ? {
        erc20Address: swap.srcTokenAddress,
        address: unlockSwapPurchaserContract?.address,
        totalAmountToApprove: actualAmount,
      }
    : {
        erc20Address,
        address: lockAddress,
        totalAmountToApprove: actualAmount,
      }

  // Only ask for approval if the lock or swap is priced in ERC20
  if (approvalOptions.erc20Address && approvalOptions.erc20Address !== ZERO) {
    await approveAllowance.bind(this)(approvalOptions)
  }

  const transactionPromise = swap
    ? unlockSwapPurchaserContract?.swapAndCall(
        lockAddress,
        swap.srcTokenAddress || ZERO,
        swap.amountInMax,
        swap.uniswapRouter,
        swap.swapCallData,
        callData,
        transactionOptions
      )
    : lockContract.purchaseFor(owner, transactionOptions)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)

  if (receipt.status === 0) {
    throw new Error('Transaction failed')
  }

  const parser = lockContract.interface

  const transferEvent = receipt.logs
    .map((log) => {
      if (log.address.toLowerCase() !== lockAddress.toLowerCase()) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Transfer'
    })[0]

  if (transferEvent) {
    return transferEvent.args._tokenId.toString()
  }
  // There was no Transfer log (transaction failed?)
  return null
}
