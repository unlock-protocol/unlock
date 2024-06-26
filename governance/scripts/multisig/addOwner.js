const { ethers } = require('hardhat')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const Safe = require('@safe-global/protocol-kit').default
const SafeApiKit = require('@safe-global/api-kit').default

async function main({ newOwner, safeAddress, threshold } = {}) {
  const { id, multisig, name, provider } = await getNetwork()
  let [signer] = await ethers.getSigners()

  if (!safeAddress) {
    safeAddress = multisig
  }

  if (!safeAddress) {
    throw new Error(`Missing multisig address for ${name} [${id}].`)
  }

  // default to ccarfi.eth
  console.log(`Adding signer ${newOwner} on chain on ${id}: 
  - multisig: ${safeAddress}
  - signer: ${signer.address}
  `)

  // Use Safe v1+ with SDK
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error(
      `The DEPLOYER_PRIVATE_KEY needs to be exported to shell to add a new owner`
    )
  }
  const safeSdk = await Safe.init({
    provider,
    signer: process.env.DEPLOYER_PRIVATE_KEY,
    safeAddress,
  })
  const safeService = new SafeApiKit({
    chainId: id,
  })

  // get nonce so we make sure we dont erase current pending tx
  const nonce = await safeService.getNextNonce(safeAddress)
  const safeTransaction = await safeSdk.createAddOwnerTx(
    {
      ownerAddress: newOwner,
      // threshold
    },
    { nonce }
  )

  // Get the transaction hash of the safeTransaction
  const safeTransactionHash = await safeSdk.getTransactionHash(safeTransaction)
  console.log(`submitting tx with  hash : ${safeTransactionHash} ...`)

  // get signature
  const senderSignature = await safeSdk.signHash(safeTransactionHash)

  // Propose the transaction
  const txParams = {
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: signer.address,
    senderSignature: senderSignature.data,
  }

  await safeService.proposeTransaction(txParams)
  const { nonce: actualNonce } =
    await safeService.getTransaction(safeTransactionHash)
  console.log(`tx submitted - nonce: [${actualNonce}].`)
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
