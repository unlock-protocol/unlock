import { ZERO } from '../../constants'
import { approveTransfer, getAllowance } from '../../erc20'
import formatKeyPrice from '../utils/formatKeyPrice'

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
  { lockAddress, tokenId, keyPrice, erc20Address, decimals, referrer, data },
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
    data = []
  }

  // If erc20Address was not provided, get it
  if (!erc20Address) {
    erc20Address = await lockContract.tokenAddress()
  }
  let actualAmount
  if (!keyPrice) {
    // We might not have the keyPrice, in which case, we need to retrieve from the the lock!
    actualAmount = await lockContract.keyPrice()
  } else {
    actualAmount = await formatKeyPrice(
      keyPrice,
      erc20Address,
      decimals,
      this.provider
    )
  }

  if (erc20Address && erc20Address !== ZERO) {
    const approvedAmount = await getAllowance(
      erc20Address,
      lockAddress,
      this.provider,
      this.signer.address
    )
    if (!approvedAmount || approvedAmount.lt(actualAmount)) {
      // We must wait for the transaction to pass if we want the next one to succeed!
      await (
        await approveTransfer(
          erc20Address,
          lockAddress,
          actualAmount,
          this.provider,
          this.signer
        )
      ).wait()
    }
  } else {
    transactionOptions.value = actualAmount
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

      const gasLimit = await lockContract.estimateGas.extend(
        actualAmount,
        tokenId,
        referrer,
        data,
        transactionOptions
      )
      // Remove the gas prices settings for the actual transaction (the wallet will set them)
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
      transactionOptions.gasLimit = gasLimit.mul(13).div(10).toNumber()
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

  const transactionPromise = lockContract.extend(
    actualAmount,
    tokenId,
    referrer,
    data,
    transactionOptions
  )

  const hash = await this._handleMethodCall(transactionPromise)

  if (callback) {
    callback(null, hash, await transactionPromise)
  }
  await this.provider.waitForTransaction(hash)
}
