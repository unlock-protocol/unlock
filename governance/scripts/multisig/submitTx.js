const { ethers } = require('hardhat')
const {
  getSafeAddress,
  getSafeVersion,
  submitTxOldMultisig,
  confirmMultisigTx,
  safeServiceURLs,
} = require('../../helpers/multisig')
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')

const { EthersAdapter } = require('@safe-global/protocol-kit')
const Safe = require('@safe-global/protocol-kit').default
const SafeApiKit = require('@safe-global/api-kit').default

async function main({ safeAddress, tx, signer }) {
  const { chainId, id } = await getNetwork()
  if (!safeAddress) {
    safeAddress = getSafeAddress(chainId)
  }
  if (!signer) {
    ;[signer] = await ethers.getSigners()
  }

  if (process.env.RUN_FORK) {
    throw Error(`Can not send multisig tx on a forked network`)
  }

  // check safe version
  const version = await getSafeVersion(safeAddress)

  // mainnet still use older versions of the safe
  if (version === 'old') {
    const nonce = await submitTxOldMultisig({ safeAddress, tx, signer })
    return nonce
  }

  // Use Safe v1+ with SDK
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })

  // get Safe service URL if not default
  const txServiceUrl = safeServiceURLs[id]
  console.log(`Using Safe Global service at ${txServiceUrl} - chain ${id}`)

  const safeService = new SafeApiKit({
    chainId: id,
    txServiceUrl: txServiceUrl || null,
  })

  // create tx
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })
  const txs = !Array.isArray(tx) ? [tx] : tx

  const explainer = txs
    .map(({ functionName, functionArgs, explainer }) =>
      explainer
        ? explainer
        : `'${functionName}(${Object.values(functionArgs).toString()})'`
    )
    .join(', ')
  console.log(`Submitting txs: ${explainer}`)

  // parse transactions
  const transactions = await Promise.all(
    txs.map(async (tx) => {
      // encode contract call
      const {
        contractNameOrAbi,
        contractAddress,
        functionName,
        functionArgs,
        calldata,
        value, // in ETH
      } = tx

      let encodedFunctionCall
      if (!calldata) {
        const { interface } = await ethers.getContractAt(
          contractNameOrAbi,
          ADDRESS_ZERO
        )
        encodedFunctionCall = interface.encodeFunctionData(
          functionName,
          functionArgs
        )
      } else {
        encodedFunctionCall = calldata
      }

      return {
        to: contractAddress,
        data: encodedFunctionCall,
        value: value || 0,
        // operation, // Optional
      }
    })
  )
  console.log(transactions)

  // get correct nonce
  const nonce = await safeService.getNextNonce(safeAddress)
  const txOptions = {
    origin: explainer,
    nonce, // make sure we get the correct nonce, so we dont override
    // txs that havent been executed yet
  }

  // create a MultiSend tx
  const safeTransaction = await safeSdk.createTransaction({
    transactions,
    options: txOptions,
  })

  // now send tx via Safe Global web service
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
  const senderSignature = await safeSdk.signTransactionHash(safeTxHash)

  await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: signer.address,
    senderSignature: senderSignature.data,
  })

  const { nonce: actualNonce } = await safeService.getTransaction(safeTxHash)
  console.log(`Tx submitted to multisig with id: '${actualNonce}'`)

  if (process.env.RUN_MAINNET_FORK) {
    console.log(`Signing multisigs: ${nonce}`)
    await confirmMultisigTx({
      transactionId: nonce,
      multisigAddress: safeAddress,
    })
  }
}

module.exports = main
