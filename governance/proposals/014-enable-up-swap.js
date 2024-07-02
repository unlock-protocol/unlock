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
  const { id, name, multisig, unlockDaoToken, explorer } =
    await getNetwork(destChainId)
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
    proposalName: `# Activate UDT/UP Swap Contract
    
This proposal will activate the swap contract that lets anyone swap between UDT and the upcoming UP Token.

As a reminder, every UDT can be swapped for 1,000 UP, and vice versa.

In technical terms, the goal of the proposal is to set the correct implementation of the UPSwap contract 
to the existing proxy. We are using [OpenZeppelin's Transparent Upgradable Proxy pattern](https://docs.openzeppelin.com/upgrades). 
This upgrade can only be triggered by the Unlock DAO.

The \`UPSwap\` contract ([source code](https://github.com/unlock-protocol/unlock/blob/master/smart-contracts/contracts/tokens/UP/UPSwap.sol)) has been reviewed by [Code4rena](https://code4rena.com/).

The contracts on Base::

- [UDT address on Base: ${unlockDaoToken.address}](${explorer.urls.address(unlockDaoToken.address)})
- [The UPToken contract will be deployed at ${upTokenExpectedAddress}](${explorer.urls.address(upTokenExpectedAddress)}). This is empty for now, as the UP Token has not yet been deployed.
- [The UPSwap contract proxy is deployed at ${upSwapProxyAddress}](${explorer.urls.address(upSwapProxyAddress)})
- [The UPSwap implementation ${upSwapImplAddress}](${explorer.urls.address(upSwapImplAddress)})
    `,
    calls: [crossChainCall],
  }
}
