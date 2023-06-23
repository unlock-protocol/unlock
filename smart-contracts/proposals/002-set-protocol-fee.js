const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

async function main({
  unlockAddress = '0x15334fe6F1cb0e286E1F9e1268B44E4221E169B7',
} = {}) {
  const { chainId } = await ethers.provider.getNetwork()
  if (chainId !== 31337) {
    ;({ unlockAddress } = networks[chainId])
  }

  const protocolFee = ethers.utils.parseEther('0.000001')

  console.log(`Proposol to set protocoloFee to ${ethers.utils.formatEther(
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
