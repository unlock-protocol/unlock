const { ethers } = require('hardhat')
const {
  getSafeAddress,
  getSafeVersion,
  submitTxOldMultisig,
  confirmMultisigTx,
} = require('./_helpers')

const Safe = require('@safe-global/safe-core-sdk').default
const SafeServiceClient = require('@safe-global/safe-service-client').default
const EthersAdapter = require('@safe-global/safe-ethers-lib').default

// see https://docs.safe.global/learn/safe-core/safe-core-api/available-services
const safeServiceURLs = {
  1: 'https://safe-transaction-mainnet.safe.global/',
  5: 'https://safe-transaction-goerli.safe.global/',
  10: 'https://safe-transaction-optimism.safe.global/',
  56: 'https://safe-transaction-bsc.safe.global/',
  100: 'https://safe-transaction-gnosis-chain.safe.global/',
  137: 'https://safe-transaction-polygon.safe.global/',
  42161: 'https://safe-transaction-arbitrum.safe.global',
  43114: 'https://safe-transaction-avalanche.safe.global/',
  42220: 'http://mainnet-tx-svc.celo-safe-prod.celo-networks-dev.org/',
  11297108109: 'https://safe-client.palm.io',
  // mumbai isnt supported by Safe Global, you need to run Safe infrastructure locally
  80001: 'http://localhost:8000/cgw/',
}

async function main({ safeAddress, tx, signer }) {
  const { chainId } = await ethers.provider.getNetwork()
  if (!safeAddress) {
    safeAddress = getSafeAddress(chainId)
  }
  if (!signer) {
    ;[signer] = await ethers.getSigners()
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

  // get Safe service
  const id = await ethAdapter.getChainId()
  const txServiceUrl = safeServiceURLs[id]
  console.log(`Using Safe Global service at ${txServiceUrl} - chain ${id}`)

  const safeService = new SafeServiceClient({
    txServiceUrl,
    ethAdapter,
  })

  // create tx
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })

  const txs = !Array.isArray(tx) ? [tx] : tx

  const explainer = txs
    .map(
      ({ functionName, functionArgs }) =>
        `'${functionName}(${Object.values(functionArgs).toString()})'`
    )
    .join(', ')
  console.log(`Submitting txs: ${explainer}`)

  // parse transactions
  const transactions = await Promise.all(
    txs.map(async (tx) => {
      // encode contract call
      const {
        contractName,
        contractAddress,
        functionName,
        functionArgs,
        calldata,
        value, // in ETH
      } = tx

      let encodedFunctionCall
      if (!calldata) {
        const { interface } = await ethers.getContractFactory(contractName)
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

  const nonce = await safeService.getNextNonce(safeAddress)
  const txOptions = {
    origin: explainer,
    nonce, // make sure we get the correct nonce, so we dont override
    // txs that havent been executed yet
  }

  // create a MultiSend tx
  const safeTransaction = await safeSdk.createTransaction({
    safeTransactionData: transactions,
    options: txOptions,
  })

  // now send tx via Safe Global web service
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
  const senderSignature = await safeSdk.signTransactionHash(safeTxHash)
  // const nonce = await safeService.getNextNonce(safeAddress)

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
