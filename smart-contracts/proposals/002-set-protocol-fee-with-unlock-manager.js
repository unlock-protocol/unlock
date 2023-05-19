/**
 * This demonstrate how to manipulate Unlock through DAO via Unlock Owner 
 * contract (without using a bridge).
 * 
 * yarn hardhat gov:submit --gov-address 0xDcDE260Df00ba86889e8B112DfBe1A4945B35CA9 \
 * --proposal proposals/002-set-protocol-fee.js \
 * --network goerli
 */
const { ethers } = require('hardhat')

const { parseUnlockOwnerCalldata } = require('../helpers/gov')
const bridge = require('../helpers/bridge')

async function main () {
  const { chainId } = await ethers.provider.getNetwork()
  const { unlockOwnerAddress } = bridge[chainId]

  // make sure chain is correct
  const unlockOwner = await ethers.getContractAt('UnlockOwner', unlockOwnerAddress)
  const daoChainId = await unlockOwner.daoChainId() 
  if (chainId.toString() !== daoChainId.toString()) {
    throw Error(`execDAO can only be used on mainnet (chain ${daoChainId})`)
  }

  const protocolFee = ethers.utils.parseEther('0.000003')
  const proposalName = `Set protocol fee to ${protocolFee}`

  // parse Unlock call data
  const unlockOwnerCalldata = await parseUnlockOwnerCalldata({
    action: 1,
    functionName: 'setProtocolFee',
    functionArgs: [ protocolFee ],
  })

  // parse Unlock call data
  const proposalArgs = {
    contractName: 'UnlockOwner',
    contractAddress: unlockOwnerAddress,
    functionName: 'execDAO',
    functionArgs: [ unlockOwnerCalldata ],
    proposalName 
  }

  console.log(proposalArgs)

  return proposalArgs
}

module.exports = main