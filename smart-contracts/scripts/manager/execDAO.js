const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { parseProposal, submitProposal} = require('../../helpers/gov')

const functionName = 'setProtocolFee'
const functionArgs = [ ethers.utils.parseEther('0.000002')]

async function main({
  unlockAddress,
  govAddress,
  unlockOwnerAddress,
  calldata
} = {}) {
  const { chainId } = await ethers.provider.getNetwork()
  if (!unlockOwnerAddress) {
    ;({ unlockOwnerAddress } = await networks[chainId])
  }
  if (!unlockAddress) {
    ;({ unlockAddress } = await networks[chainId])
  }
  
  // make sure chain is correct
  const unlockOwner = await ethers.getContractAt('UnlockOwner', unlockOwnerAddress)
  const mainnetChainId = await unlockOwner.mainnetChainId() 
  if (chainId.toString() !== mainnetChainId.toString()) {
    throw Error(`execDAO can only be used on mainnet (chain ${mainnetChainId})`)
  }

  if(!calldata) {
    // parse Unlock calldata 
    const { interface: unlockInterface } = await ethers.getContractFactory('Unlock')
    const unlockCallData = unlockInterface.encodeFunctionData(
      functionName,
      functionArgs
    )
    // parse execMultisig instructions
    calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [1, unlockCallData])
  }

  console.log({
    unlockAddress,
    govAddress,
    unlockOwnerAddress,
    functionName,
    functionArgs,
    calldata
  })

  // send as DAO proposal
  const proposalArgs = {
    contractName: 'UnlockOwner',
    contractAddress: unlockOwnerAddress,
    functionName: 'execMultisig',
    functionArgs: [ calldata ],
    proposalName: 'change protocol fee'
  }

  // console.table(proposalArgs)
  
  const proposal = await parseProposal(proposalArgs)
  // console.table(proposal)

  const tx = await submitProposal({ govAddress, proposal })
  console.log(tx)

}

module.exports = main