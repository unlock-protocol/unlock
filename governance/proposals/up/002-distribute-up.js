/**
 * Set Unlock on Base to distribute UP token
 */
const { ethers } = require('hardhat')
const { Unlock } = require('@unlock-protocol/contracts')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

module.exports = async () => {
  const proposalName = `Distribute UP through Unlock contracts
  
Switching from distributing UDT to UP when using referrers.`

  const { unlockAddress, multisig } = await getNetwork()

  // parse config args from existing settings
  const unlock = await ethers.getContractAt(Unlock.abi, unlockAddress)
  const configUnlockArgs = [
    upTokenAddress,
    await unlock.weth(),
    await unlock.estimatedGasForPurchase(),
    await unlock.getGlobalTokenSymbol(),
    await unlock.globalBaseTokenURI(),
    await unlock.chainId(),
  ]

  // encode instructions to be executed by the SAFE
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const moduleData = await abiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      unlockAddress, // to
      0, // value
      unlock.interface.encodeFunctionData('configUnlock', configUnlockArgs), // data
      0, // operation: 0 for CALL, 1 for DELEGATECALL
    ]
  )

  return {
    proposalName,
    calls: [
      {
        contractAddress: multisig,
        calldata: moduleData,
      },
    ],
  }
}
