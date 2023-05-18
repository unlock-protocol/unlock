const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const submitTx = require('../multisig/submitTx')

const functionName = 'setProtocolFee'
const functionArgs = [ ethers.utils.parseEther('0.000001')]

async function main({
  unlockAddress,
  multisig,
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
  if (!multisig) {
    ;({ multisig } = await networks[chainId])
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

  console.table({
    unlockAddress,
    multisig,
    unlockOwnerAddress,
    functionName,
    functionArgs
  })

  // send to multisig
  const tx = {
    contractName: 'UnlockOwner',
    contractAddress: unlockOwnerAddress,
    functionName: 'execMultisig',
    functionArgs: [ calldata ],
    }
  
  console.log(tx)
  await submitTx({ safeAddress: multisig, tx })
}

module.exports = main