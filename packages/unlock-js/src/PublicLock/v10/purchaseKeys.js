import { ZERO } from '../../constants'
import getPurchaseKeysArguments from './getPurchaseKeysArguments'
import approveAllowance from '../utils/approveAllowance'
import { ethers } from 'ethers'

/**
 * Purchase key function. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.arrayOf(PropTypes.address)} lockAddress
 * - {PropTypes.arrayOf(PropTypes.address)} owners
 * - {PropTypes.arrayOf(string)} keyPrices
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * - {PropTypes.arrayOf(PropTypes.address)} referrers (address which will receive UDT - if applicable)
 * - {PropTypes.arrayOf(number)} recurringPayments the number of payments to allow for each keys. If the array is set, the keys are considered using recurring ERRC20 payments).
 * - {PropTypes.arrayOf(PropTypes.array[bytes])} _data (array of array of bytes, not used in transaction but can be used by hooks)
 * @param {function} callback invoked with the transaction hash
 */
export default async function (options, transactionOptions = {}, callback) {
  const { lockAddress, swap } = options
  const lockContract = await this.getLockContract(lockAddress)
  const {
    owners,
    keyPrices,
    keyManagers,
    referrers,
    data,
    totalPrice,
    erc20Address,
    totalAmountToApprove,
  } = await getPurchaseKeysArguments.bind(this)(options)

  const unlockSwapPurchaserContract = swap
    ? this.getUnlockSwapPurchaserContract({
        params: {
          network: this.networkId,
        },
      })
    : null

  const purchaseArgs = [keyPrices, owners, referrers, keyManagers, data]
  const callData = lockContract.interface.encodeFunctionData(
    'purchase',
    purchaseArgs
  )

  // tx options
  if (!erc20Address || erc20Address === ZERO) {
    transactionOptions.value = totalPrice
  }

  // if swap is provided, we need to override the value
  if (swap && swap?.value) {
    transactionOptions.value = swap.value
  }

  // If the lock is priced in ERC20, we need to approve the transfer
  const approvalOptions = swap
    ? {
        erc20Address: swap.srcTokenAddress,
        address: unlockSwapPurchaserContract?.address,
        totalAmountToApprove: swap.amountInMax,
      }
    : {
        erc20Address,
        totalAmountToApprove,
        address: lockAddress,
      }

  // Only ask for approval if the lock or swap is priced in ERC20
  if (approvalOptions.erc20Address && approvalOptions.erc20Address !== ZERO) {
    await approveAllowance.bind(this)(approvalOptions)
  }

  // Estimate gas. Bump by 30% because estimates are wrong!
  if (!transactionOptions.gasLimit) {
    const preserveGasSettings =
      transactionOptions.maxFeePerGas || transactionOptions.gasPrice
    try {
      // To get good estimates we need the gas price, because it matters in the actual execution (UDT calculation takes it into account)
      // TODO remove once we move to use block.baseFee in UDT calculation
      if (!preserveGasSettings) {
        const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
          await this.provider.getFeeData()

        if (maxFeePerGas && maxPriorityFeePerGas) {
          transactionOptions.maxFeePerGas = maxFeePerGas
          transactionOptions.maxPriorityFeePerGas = maxPriorityFeePerGas
        } else {
          transactionOptions.gasPrice = gasPrice
        }
      }

      const gasLimitPromise = swap
        ? unlockSwapPurchaserContract?.estimateGas?.swapAndCall(
            lockAddress,
            swap.srcTokenAddress || ZERO,
            swap.amountInMax,
            swap.uniswapRouter,
            swap.swapCallData,
            callData,
            transactionOptions
          )
        : lockContract.estimateGas.purchase(
            keyPrices,
            owners,
            referrers,
            keyManagers,
            data,
            transactionOptions
          )

      const gasLimit = await gasLimitPromise
      transactionOptions.gasLimit = gasLimit.mul(13).div(10).toNumber()
    } catch (error) {
      console.error(
        'We could not estimate gas ourselves. Let wallet do it.',
        error
      )
    }
    if (!preserveGasSettings) {
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
    }
  }

  const transactionRequestPromise = swap
    ? unlockSwapPurchaserContract?.populateTransaction?.swapAndCall(
        lockAddress,
        swap.srcTokenAddress || ZERO,
        swap.amountInMax,
        swap.uniswapRouter,
        swap.swapCallData,
        callData,
        transactionOptions
      )
    : lockContract.populateTransaction.purchase(
        keyPrices,
        owners,
        referrers,
        keyManagers,
        data,
        transactionOptions
      )

  const transactionRequest = await transactionRequestPromise

  if (transactionOptions.runEstimate) {
    const estimate = lockContract.signer.estimateGas(transactionRequest)
    return {
      transactionRequest,
      estimate,
    }
  }

  const transactionPromise =
    lockContract.signer.sendTransaction(transactionRequest)

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
  const transferEvents = receipt.logs
    .map((log) => {
      if (log.address.toLowerCase() !== lockAddress.toLowerCase()) return // Some events are triggered by the ERC20 contract
      return parser.parseLog(log)
    })
    .filter((event) => {
      return event && event.name === 'Transfer'
    })

  if (transferEvents && transferEvents.length) {
    return transferEvents.map((v) => v.args.tokenId.toString())
  }
  // There was no Transfer log (transaction failed?)
  return null
}
