const { ethers, upgrades } = require('hardhat')
const {
  getNetwork,
  getProxyAdminAddress,
  copyAndBuildContractsAtVersion,
  deployUpgradeableContract,
  deployContract,
} = require('@unlock-protocol/hardhat-helpers')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const { submitTx } = require('../multisig')

async function main({
  performUpgrade = true,
  upProxyAddress = '0x7588337Bb4c5a8b374CC5d27111cEaE66d53fA6A',
  upImplAddress = '0x2Ea27712EaB8574088A824147eC4c0f108aacE78',
} = {}) {
  let hash
  if (!upProxyAddress) {
    // deploys an empty UP contract to be filled later by actual implementation
    const EmptyImpl = await ethers.getContractFactory('EmptyImpl')
    ;({ hash, address: upProxyAddress } =
      await deployUpgradeableContract(EmptyImpl))
    console.log(
      `UP Proxy (with empty impl) deployed at ${upProxyAddress} (tx: ${hash})`
    )
  }
  if (!upImplAddress) {
    // deploys the UP token implementation
    const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
      __dirname,
      [{ contractName: 'UPSwap', subfolder: 'UP' }]
    )
    ;({ hash, address: upImplAddress } =
      await deployContract(upTokenQualifiedPath))
    console.log(`UP impl  deployed at ${upImplAddress} (tx: ${hash})`)
  }

  if (performUpgrade) {
    // parse UP token initialization call
    const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
      __dirname,
      [{ contractName: 'UPToken', subfolder: 'UP' }]
    )
    const { id, multisig } = await getNetwork()
    const initialOwner = multisig
    const UPToken = await ethers.getContractFactory(upTokenQualifiedPath)
    const initializeCall = UPToken.interface.encodeFunctionData('initialize', [
      initialOwner,
    ])

    // prepare upgrade call for proxy admin
    const proxyAdminAddress = await getProxyAdminAddress({ chainId: id })
    console.log(`proxyAdminAddress: ${proxyAdminAddress}`)
    const proxyAdmin = await ethers.getContractAt(
      proxyAdminABI,
      proxyAdminAddress
    )
    const upgradeArgs = [upProxyAddress, upImplAddress, initializeCall]
    const encodedUpgradeCall = proxyAdmin.interface.encodeFunctionData(
      'upgradeAndCall',
      upgradeArgs
    )

    // parse tx for multisig
    const txArgs = {
      safeAddress: multisig,
      tx: {
        contractAddress: proxyAdminAddress,
        functionName: 'upgradeAndCall', // just for explainer
        functionArgs: upgradeArgs, // just for explainer
        value: 0, // ETH value
        calldata: encodedUpgradeCall,
      },
    }

    // send tx to multisig
    const transactionId = await submitTx(txArgs)
    console.log(`Submitted to multisig ${multisig}: nonce ${transactionId}`)
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
