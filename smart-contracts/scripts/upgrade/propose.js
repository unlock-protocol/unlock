const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

const { abi: proxyABI } = require('../../test/helpers/ABIs/ProxyAdmin.json')
const { confirmMultisigTx, impersonate } = require('../../test/helpers')

const { submitTx, getOwners } = require('../multisig')

// used to update contract implementation address in proxy admin using multisig
async function main({ proxyAddress, proxyAdminAddress, implementation }) {
  // env settings
  const { chainId } = await ethers.provider.getNetwork()
  const { multisig } = networks[chainId]
  let [signer] = await ethers.getSigners()

  // impersonate multisig owner
  if (chainId === 31337) {
    const owners = await getOwners(chainId)
    signer = await ethers.getSigner(owners[0])
    await impersonate(owners[0])
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
  const args = [
    proxyAddress,
    implementation,
  ]
  const data = interface.encodeFunctionData('upgrade', args)

  // submit proxy upgrade tx to proxyAdmin
  const transactionId = await submitTx({
    safeAddress: multisig,
    tx: {
      contractAddress: proxyAdminAddress,
      functionName: 'upgrade', // just for explainer
      functionArgs: args, // just for explainer
      value: 0, // ETH value
      calldata: data,
    },
    signer
  })

  // make sure it doesnt revert
  if (chainId === 31337) {
    await confirmMultisigTx({ transactionId })
  }
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
