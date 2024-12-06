export default async function (
  {
    lockAddress,
    tokenId,
  }: {
    lockAddress: string
    tokenId: number
  },
  transactionOptions: {
    runEstimate?: boolean
    gasLimit?: bigint
    maxFeePerGas?: string
    maxPriorityFeePerGas?: string
    gasPrice?: string
  } = {},
  callback: (error: any, hash: string, transactionPromise: any) => void
) {
  const lockContract = await this.getLockContract(lockAddress)

  if (!tokenId) {
    throw new Error('Missing tokenId.')
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

      const gasLimitPromise = lockContract.burnKey.estimateGas(
        tokenId,
        transactionOptions
      )
      const gasLimit = await gasLimitPromise
      // Remove the gas prices settings for the actual transaction (the wallet will set them)
      delete transactionOptions.maxFeePerGas
      delete transactionOptions.maxPriorityFeePerGas
      delete transactionOptions.gasPrice
      transactionOptions.gasLimit = gasLimit
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

  const transactionRequestpromise = lockContract.burnKey.populateTransaction(
    [tokenId],
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
