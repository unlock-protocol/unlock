/**
 * Set Unlock on Base to distribute UP token
 */
const { ethers } = require('hardhat')
const { Unlock } = require('@unlock-protocol/contracts')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const upTokenAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

module.exports = async () => {
  const proposalName = `Distribute UP through the Unlock contract
  
This proposal enables the distribution of the UPToken on Base as the protocol reward when a referrer is specified during purchase, extension or renewal of a key. 

The distribution of UDT that was previously active on Base will therefore be replaced by UPToken through this proposed change.

As part of this update, an Uniswap oracle is also set in Unlock to support price discovery for UPToken from the WETH/Uniswap pool.
`

  const { unlockAddress, uniswapV3 } = await getNetwork()

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

  return {
    proposalName,
    calls,
  }
}
