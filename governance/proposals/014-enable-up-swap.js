const { ethers } = require('hardhat')
const {
  getNetwork,
  getProxyAdminAddress,
  copyAndBuildContractsAtVersion,
} = require('@unlock-protocol/hardhat-helpers')
const { parseBridgeCall } = require('../helpers/crossChain')
const {
  abi: proxyAdminABI,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/ProxyAdmin.json')

const srcChainId = 100 // TODO: change to mainnet
const destChainId = 137 // TODO: change to Base

module.exports = async ({
  // UP token address
  upTokenExpectedAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187',
  // empty proxy
  upSwapProxyAddress = '0x..',
  // actual swap impl
  upSwapImplAddress = '0x...',
} = {}) => {
  const { id, name, multisig, unlockDaoToken } = await getNetwork(destChainId)
  // const multisig = '0x6ff837695B120A8f533498584249131F1c6fC4a8'
  console.log(`Submitting proposal on ${name} (${destChainId})`)

  // parse UP token upgrade + initialization call
  const [upTokenQualifiedPath] = await copyAndBuildContractsAtVersion(
    __dirname,
    [{ contractName: 'UPSwap', subfolder: 'UP' }]
  )
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

  // 4. encode instructions to be executed by the SAFE on the other side of the bridge
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
