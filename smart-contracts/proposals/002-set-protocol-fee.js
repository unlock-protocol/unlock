/***
 * This demonstrates how to set a simple proposal with parameters.
 *
 * From the command line, you can use:
 *
 * ```
 * yarn hardhat gov:<submit|vote|queue|execute|id> --gov-address 0x7757f7f21f5fa9b1fd168642b79416051cd0bb94  \
 *    --network localhost \
 *    --proposal proposals/002-set-protocol-fee.js \
 *    0xe79B93f8E22676774F2A8dAd469175ebd00029FA \
 *    "0.00002"
 * ```
 *
 * The final positional parameters will be passed as arguments in the function below, allowing to set
 * values from the command line.
 */
const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

async function main([
  unlockAddress = '0x15334fe6F1cb0e286E1F9e1268B44E4221E169B7',
  protocolFeeStr = '0.000001',
]) {
  const { chainId } = await ethers.provider.getNetwork()

  if (!unlockAddress && chainId !== 31337) {
    ;({ unlockAddress } = networks[chainId])
  }

  const protocolFee = ethers.utils.parseEther(protocolFeeStr)

  console.log(`Proposol to set protocolFee to ${ethers.utils.formatEther(
    protocolFee
  )}
  - unlock : ${unlockAddress}`)

  const calls = [
    {
      contractName: 'Unlock',
      contractAddress: unlockAddress,
      functionName: 'setProtocolFee',
      functionArgs: [protocolFee],
    },
  ]

  const proposalArgs = {
    calls,
    proposalName: `Set protocol fee to ${protocolFee}`,
  }
  return proposalArgs
}

module.exports = main
