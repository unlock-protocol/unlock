const { ethers } = require('hardhat')
const {
  getSafeAddress,
  getSafeVersion,
  submitTxOldMultisig,
} = require('./_helpers')

const Safe = require('@gnosis.pm/safe-core-sdk').default
const SafeServiceClient = require('@gnosis.pm/safe-service-client').default
const EthersAdapter = require('@gnosis.pm/safe-ethers-lib').default

// see https://docs.gnosis-safe.io/backend/available-services
const gnosisServiceURLs = {
  1: 'https://safe-transaction.mainnet.gnosis.io/',
  4: 'https://safe-transaction.rinkeby.gnosis.io/',
  5: 'https://safe-transaction.goerli.gnosis.io/',
  10: 'https://safe-transaction.optimism.gnosis.io/',
  56: 'https://safe-transaction.bsc.gnosis.io/',
  100: 'https://safe-transaction.xdai.gnosis.io/',
  137: 'https://safe-transaction.polygon.gnosis.io/',
  // 'https://safe-transaction.arbitrum.gnosis.io/',
  // 'https://safe-transaction.avalanche.gnosis.io/',
  // 42220 : 'https://safe-transaction.celo.gnosis.io/',
  // mumbai missing
}

async function main({ safeAddress, tx, signer }) {
  const { chainId } = await signer.provider.getNetwork()
  if (!safeAddress) {
    safeAddress = getSafeAddress(chainId)
  }
  if (!signer) {
    ;[signer] = await ethers.getSigners()
  }

  // check safe version
  const version = await getSafeVersion(safeAddress)

  // mainnet + rinkeby still use older versions of the safe
  if (version === 'old') {
    const nonce = await submitTxOldMultisig({ safeAddress, tx, signer })
    return nonce
  }

  // Use Gnosis Safe v1+ with SDK
  const ethAdapter = new EthersAdapter({
    ethers,
    signer,
  })

  // get Gnosis service
  const id = await ethAdapter.getChainId()
  const txServiceUrl = gnosisServiceURLs[id]
  console.log(`Using Gnosis Safe service at ${txServiceUrl} - chain ${id}`)
  const safeService = new SafeServiceClient({
    txServiceUrl,
    ethAdapter,
  })

  // create tx
  const safeSdk = await Safe.create({ ethAdapter, safeAddress })

  const txs = !Array.isArray(tx) === [tx] || tx

  const explainer = []
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

      explainer.push(
        `'${functionName}(${Object.values(functionArgs).toString()})'`
      )
      return {
        to: contractAddress,
        data: encodedFunctionCall,
        value: value || 0,
        // operation, // Optional
      }
    })
  )
  console.log(explainer.join(', '))
  console.log(transactions)

  const txOptions = {
    origin: explainer.join(', '),
    // safeTxGas, // Optional
    // baseGas, // Optional
    // gasPrice, // Optional
    // gasToken, // Optional
    // refundReceiver, // Optional
    // nonce // Optional
  }

  // create a MultiSend tx
  const safeTransaction = await safeSdk.createTransaction(
    transactions,
    txOptions
  )

  // now send tx via Gnosis web service
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

  const { nonce } = await safeService.getTransaction(safeTxHash)
  console.log(`Tx submitted to multisig with id: '${nonce}'`)
}

module.exports = main
