const { ethers } = require('hardhat')

const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const Safe = require('@safe-global/protocol-kit').default
const { EthersAdapter } = require('@safe-global/protocol-kit')
const SafeApiKit = require('@safe-global/api-kit').default

async function main({
  // default to ccarfi.eth
  addressToAdd = '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f',
} = {}) {
  const { id, multisig } = await getNetwork()
  let [signer] = await ethers.getSigners()

  console.log(`Adding signer ${addressToAdd} on chain on ${id}: 
  - multisig: ${multisig}
  - signer: ${signer.address}
  `)

  // Use Safe v1+ with SDK
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })

  const safeSdk = await Safe.create({ ethAdapter, safeAddress: multisig })
  const params = {
    ownerAddress: addressToAdd,
    // threshold, // Optional. If `threshold` isn't provided the current threshold won't change.
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
    safeAddress: multisig,
    safeTransactionData: safeTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: signer.address,
    senderSignature: senderSignature.data,
  }
  console.log(txParams)
  const tx = await safeService.proposeTransaction({
    safeAddress: multisig,
    safeTransactionData: safeTransaction.data,
    safeTxHash: safeTransactionHash,
    senderAddress: signer.address,
    senderSignature: senderSignature.data,
  })

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
