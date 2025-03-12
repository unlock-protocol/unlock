import { MAX_UINT, ZERO } from '../../constants'
import formatKeyPrice from '../utils/formatKeyPrice'
import approveAllowance from '../utils/approveAllowance'

/**
 * Extend key. This implementation requires the following
 * @param {object} params:
 * - {PropTypes.address} lockAddress
 * - {string} keyPrice
 * - {number} tokenId
 * - {PropTypes.address} referrer (address which will receive UDT - if applicable)
 * - {PropTypes.array[bytes]} data (array of bytes, not used in transaction but can be used by hooks)
 * - {PropTypes.address} erc20Address
 * - {number} decimals
 * @param {function} callback invoked with the transaction hash
 */
export default async function (
  {
    lockAddress,
    tokenId,
    owner,
    keyPrice,
    erc20Address,
    decimals,
    referrer,
    data,
    totalApproval,
    recurringPayments,
  },
  transactionOptions = {},
  callback
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!tokenId) {
    throw new Error('Missing tokenId.')
  }

  if (!referrer) {
    referrer = ZERO
  }

  if (!data) {
    data = '0x'
  }

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }

  let actualAmount

  const actualOwner = await lockContract.ownerOf(tokenId)

  // We might not have the keyPrice, in which case, we need to retrieve from the lock!
  if (!keyPrice) {
    if (actualOwner) {
      actualAmount = await lockContract.purchasePriceFor(
        actualOwner,
        referrer,
        data
      )
    } else {
      actualAmount = await lockContract.keyPrice()
    }
  } else {
    actualAmount = await formatKeyPrice(
      keyPrice,
      erc20Address,
      decimals,
      this.provider
    )
  }

  const extendArgs = [actualAmount, tokenId, referrer, data]
  const callData = lockContract.interface.encodeFunctionData(
    'extend',
    extendArgs
  )

  // tx options
  if (!erc20Address || erc20Address === ZERO) {
    transactionOptions.value = actualAmount
  }

  let totalAmountToApprove = totalApproval || 0

  if (!totalAmountToApprove && actualAmount > 0) {
    if (!recurringPayments) {
      totalAmountToApprove = actualAmount
    } else if (recurringPayments === Infinity) {
      totalAmountToApprove = MAX_UINT
    } else {
      totalAmountToApprove = actualAmount * BigInt(recurringPayments)
    }
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
    try {
      // To get good estimates we need the gas price, because it matters in the actual execution (UDT calculation takes it into account)
      // TODO remove once we move to use block.baseFee in UDT calculation
      const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
        await this.provider.getFeeData()

      if (maxFeePerGas && maxPriorityFeePerGas) {
        transactionOptions.maxFeePerGas = maxFeePerGas
        transactionOptions.maxPriorityFeePerGas = maxPriorityFeePerGas
      } else {
        transactionOptions.gasPrice = gasPrice
      }

      const gasLimitPromise = lockContract.extend.estimateGas(
        actualAmount,
        tokenId,
        referrer,
        data,
        transactionOptions
      )
      const gasLimit = await gasLimitPromise
      // Remove the gas prices settings for the actual transaction (the wallet will set them)
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
      transactionOptions.gasLimit = (gasLimit * 13n) / 10n
    } catch (error) {
      console.error(
        'We could not estimate gas ourselves. Let wallet do it.',
        error
      )
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
    }
  }

  const transactionRequestpromise = lockContract.extend.populateTransaction(
    actualAmount,
    tokenId,
    referrer,
    data,
    transactionOptions
  )

  const transactionRequest = await transactionRequestpromise

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
  return hash
}
