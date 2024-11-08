/**
 * Set Unlock on Base to distribute UP token
 */
const { ethers } = require('hardhat')
const { Unlock } = require('@unlock-protocol/contracts')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { parseSafeMulticall } = require('../../helpers/multisig')

const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

module.exports = async () => {
  const proposalName = `Distribute UP through Unlock contracts
  
This proposal enables change from distributing UDT to UPToken when using referrers. This requires to also setup the Uniswap oracle 
in Unlock to support price discovery for UPToken.`

  const { unlockAddress, uniswapV3, id } = await getNetwork()

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

  const calls = [
    {
      contractAddress: unlockAddress,
      calldata: unlock.interface.encodeFunctionData('setOracle', [
        upTokenAddress,
        uniswapV3.oracle['3000'], // uniswap UP pool is 0.3%
      ]),
    },
    {
      contractAddress: unlockAddress,
      calldata: unlock.interface.encodeFunctionData(
        'configUnlock',
        configUnlockArgs
      ),
    },
  ]
  const packedCalls = await parseSafeMulticall({ chainId: id, calls })

  return {
    proposalName,
    calls: [packedCalls],
  }
}
