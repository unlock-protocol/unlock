const { ethers } = require('hardhat')
const {
  getSafeAddress,
  getSafeVersion,
  submitTxOldMultisig,
  confirmMultisigTx,
  getSafeService,
} = require('../../helpers/multisig')
const { ADDRESS_ZERO, getNetwork } = require('@unlock-protocol/hardhat-helpers')

const Safe = require('@safe-global/protocol-kit').default

async function main({ safeAddress, tx, signer }) {
  const { id: chainId, provider } = await getNetwork()
  if (!safeAddress) {
    safeAddress = await getSafeAddress(chainId)
  }
  if (!signer) {
    ;[signer] = await ethers.getSigners()
  }

  if (process.env.RUN_FORK) {
    throw Error(`Can not send multisig tx on a forked network`)
  }

  // get Safe service URL if not default
  const safeService = await getSafeService(chainId)

  // create tx
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error(
      `The DEPLOYER_PRIVATE_KEY needs to be exported to shell to add a new owner`
    )
  }
  const safeSdk = await Safe.init({
    signer: process.env.DEPLOYER_PRIVATE_KEY,
    safeAddress,
    provider,
  })
  const txs = !Array.isArray(tx) ? [tx] : tx

  let explainer = ''
  try {
    explainer = txs
      .map(({ functionName, functionArgs, explainer }) =>
        explainer
          ? explainer
          : `'${functionName}(${Object.values(functionArgs).toString()})'`
      )
      .join(', ')
    console.log(`Submitting txs: ${explainer}`)
  } catch (error) {
    console.log(`Missing explainers...`)
  }

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
  const senderSignature = await safeSdk.signHash(safeTxHash)

  await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: await signer.getAddress(),
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
