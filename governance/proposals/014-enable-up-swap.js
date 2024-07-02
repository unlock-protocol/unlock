const { ethers } = require('hardhat')
const {
  getNetwork,
  copyAndBuildContractsAtVersion,
  deployContract,
  deployUpgradeableContract,
  getProxyAdminAddress,
} = require('@unlock-protocol/hardhat-helpers')
const { parseBridgeCall } = require('../helpers/crossChain')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const srcChainId = 100 // TODO: change to mainnet
const destChainId = 137 // TODO: change to Base

module.exports = async ({
  // UP token address
  upTokenExpectedAddress = '0x...',
  // empty proxy
  upSwapProxyAddress = '0x7588337Bb4c5a8b374CC5d27111cEaE66d53fA6A',
  // actual swap impl
  upSwapImplAddress = '0x2Ea27712EaB8574088A824147eC4c0f108aacE78',
} = {}) => {
  const { id, name, multisig, unlockDaoToken } = await getNetwork(destChainId)
  // const multisig = '0x6ff837695B120A8f533498584249131F1c6fC4a8'
  console.log(`Submitting proposal on ${name} (${destChainId})`)

  // 1. deploys a proxy contract with an empty implementation
  console.log(`Deploying proxy with empty impl...`)
  const EmptyImpl = await ethers.getContractFactory('EmptyImpl')
  const { address: proxy } = await deployUpgradeableContract(EmptyImpl)

  // 2. deploys the UP token implementation
  console.log(`Deploying UPToken implementation...`)
  const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName: 'UPSwap', subfolder: 'UP' }]
  )
  const { address: impl } = await deployContract(upTokenQualifiedPath)

  console.log({
    proxy,
    impl,
  })

  // 3. parse UP token initialization call
  const UPToken = await ethers.getContractFactory(upTokenQualifiedPath)
  const initializeCall = UPToken.interface.encodeFunctionData('initialize', [
    unlockDaoToken.address, // udt,
    upTokenExpectedAddress, // up,
    multisig, // initialOwner,
  ])

  // prepare upgrade call for proxy admin
  const proxyAdminAddress = await getProxyAdminAddress({ chainId: id })
  console.log(`proxyAdminAddress: ${proxyAdminAddress}`)
  const proxyAdmin = await ethers.getContractAt(
    proxyAdminABI,
    proxyAdminAddress
  )
  const upgradeArgs = [upSwapProxyAddress, upSwapImplAddress, initializeCall]
  const encodedUpgradeCall = proxyAdmin.interface.encodeFunctionData(
    'upgradeAndCall',
    upgradeArgs
  )

  // encode instructions to be executed by the SAFE
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const moduleData = await abiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      proxyAdminAddress, // to
      0, // value
      encodedUpgradeCall, // data
      0, // operation: 0 for CALL, 1 for DELEGATECALL
    ]
  )

  // parse bridge call
  const crossChainCall = await parseBridgeCall({
    moduleData,
    srcChainId,
    destChainId,
  })

  // parse calls for Safe
  return {
    proposalName: `# Activate UP/UDT Swap
    
This proposal will activate the contract that allow to swap between UDT and the forthcoming UP Token.

In technical terms, the goal of the proposal is to set the correct implementation of the UPSwap contract 
to the existing proxy.

The \`UPSwap\` contract has been reviewed by Code Arena.

The contracts:

- UDT address on Base: ${unlockDaoToken.address}
- The UPToken contract will be located at ${upTokenExpectedAddress}
- The UPSwap contract proxy is deployed at ${upSwapProxyAddress}
- The UPSwap implementation ${upSwapImplAddress}
    `,
    calls: [crossChainCall],
  }
}
