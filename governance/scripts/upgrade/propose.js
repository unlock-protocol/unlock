const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

const {
  abi: proxyABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')
const { submitTx } = require('../multisig')

// used to update contract implementation address in proxy admin using multisig
async function main({
  proxyAddress,
  proxyAdminAddress,
  implementation,
  multisig,
}) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  let [signer] = await ethers.getSigners()
  if (!multisig) {
    ;({ multisig } = networks[chainId])
  }

  console.log(`Submitting contract upgrade on chain ${chainId}: 
  - proxy: ${proxyAddress}
  - proxyAdmin: ${proxyAdminAddress}
  - implementation: ${implementation}
  - multisig: ${multisig}
  - signer: ${signer.address}
  `)

  // build upgrade tx
  const { interface } = await ethers.getContractAt(proxyABI, proxyAdminAddress)
  const args = [proxyAddress, implementation]
  const data = interface.encodeFunctionData('upgrade', args)

  // submit proxy upgrade tx to proxyAdmin
  const txArgs = {
    safeAddress: multisig,
    tx: {
      contractAddress: proxyAdminAddress,
      functionName: 'upgrade', // just for explainer
      functionArgs: args, // just for explainer
      value: 0, // ETH value
      calldata: data,
    },
    signer,
  }
  const transactionId = await submitTx(txArgs)
  console.log(transactionId)
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
