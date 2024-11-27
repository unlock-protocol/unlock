import { ZERO } from '../../constants'
import getPurchaseKeysArguments from './getPurchaseKeysArguments'
import approveAllowance from '../utils/approveAllowance'

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
  const { lockAddress } = options
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

  const purchaseArgs = [keyPrices, owners, referrers, keyManagers, data]

  // calldata only
  if (options.returnCalldata) {
    const callData = lockContract.interface.encodeFunctionData(
      'purchase',
      purchaseArgs
    )
    return callData
  }

  // tx options
  if (!erc20Address || erc20Address === ZERO) {
    transactionOptions.value = totalPrice
  }

  // If the lock is priced in ERC20, we need to approve the transfer
  const approvalOptions = {
    erc20Address,
    totalAmountToApprove,
    address: lockAddress,
  }

  // Only ask for approval if the lock is priced in ERC20
  if (
    approvalOptions.erc20Address &&
    approvalOptions.erc20Address !== ZERO &&
    totalAmountToApprove > 0
  ) {
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

      const gasLimitPromise = lockContract.purchase.estimateGas(
        keyPrices,
        owners,
        referrers,
        keyManagers,
        data,
        transactionOptions
      )

      const gasLimit = await gasLimitPromise
      transactionOptions.gasLimit = (gasLimit * 13n) / 10n
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

  const transactionRequestPromise = lockContract.purchase.populateTransaction(
    keyPrices,
    owners,
    referrers,
    keyManagers,
    data,
    transactionOptions
  )

  const transactionRequest = await transactionRequestPromise
  if (transactionOptions.runEstimate) {
    const estimate = this.signer.estimateGas(transactionRequest)
    return {
      transactionRequest,
      estimate,
    }
  }

  const transactionPromise = this.signer.sendTransaction(transactionRequest)

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }

  // Let's now wait for the transaction to go thru to return the token id
  const receipt = await this.provider.waitForTransaction(hash)

  if (receipt.status === 0) {
    throw new Error('Transaction failed')
  }

  const transferEvents = receipt.logs
    .map((log) => {
      if (log.address.toLowerCase() !== lockAddress.toLowerCase()) return // Some events are triggered by the ERC20 contract
      return lockContract.interface.parseLog(log)
    })
    .filter((evt) => evt?.fragment && evt.fragment?.name === 'Transfer')

  if (transferEvents && transferEvents.length) {
    return transferEvents.map((v) => v.args.tokenId.toString())
  }
  // There was no Transfer log (transaction failed?)
  return null
}
