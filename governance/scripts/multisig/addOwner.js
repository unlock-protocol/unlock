const { ethers } = require('hardhat')

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const Safe = require('@safe-global/protocol-kit').default
const { EthersAdapter } = require('@safe-global/protocol-kit')
const SafeApiKit = require('@safe-global/api-kit').default

async function main({ newOwner, safeAddress, threshold } = {}) {
  const { id, multisig } = await getNetwork()
  let [signer] = await ethers.getSigners()

  if (!safeAddress) {
    safeAddress = multisig
  }

  // default to ccarfi.eth
  console.log(`Adding signer ${newOwner} on chain on ${id}: 
  - multisig: ${safeAddress}
  - signer: ${signer.address}
  `)

  // Use Safe v1+ with SDK
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })

  const safeSdk = await Safe.create({ ethAdapter, safeAddress })
  const params = {
    ownerAddress: newOwner,
    // threshold
  }
  const safeTransaction = await safeSdk.createAddOwnerTx(params)

  // Get the transaction hash of the safeTransaction
  const safeTransactionHash = await safeSdk.getTransactionHash(safeTransaction)
  console.log(`submitting tx with hash : ${safeTransactionHash}`)

  const safeService = new SafeApiKit({
    chainId: id,
  })

  const senderSignature = await safeSdk.signTransactionHash(safeTransactionHash)

  // Propose the transaction
  const txParams = {
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: signer.address,
    senderSignature: senderSignature.data,
  }
  console.log()
  await safeService.proposeTransaction(txParams)
  console.log(`tx submitted.`)
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
