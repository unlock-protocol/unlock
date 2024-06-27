const { ethers } = require('hardhat')
const { SafeProvider } = require('@safe-global/protocol-kit')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { parseBridgeCall } = require('../helpers/crossChain')

// TODO : change to base
const destChainId = 137 // polygon

module.exports = async () => {
  const { name, provider, multisig } = await getNetwork(destChainId)

  console.log(`Deploying to ${name} (${destChainId}) using safe ${multisig}`)

  // get the CallCreate instance from Safe
  const safeProvider = new SafeProvider({
    provider,
  })
  const createCallContract = await safeProvider.getCreateCallContract({
    safeVersion: '1.3.0',
  })

  // parse deployment tx
  const Dummy = await ethers.getContractFactory('Dummy')
  const { data: deploymentData } = await Dummy.getDeployTransaction(12n)
  console.log({ deploymentData })

  // parse CreateCall call for safe
  const createCallInterface = new ethers.Interface(
    createCallContract.contractAbi
  )
  const callData = createCallInterface.encodeFunctionData('performCreate', [
    '0',
    deploymentData,
  ])

  // encode instructions to be executed by the SAFE
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const moduleData = await abiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      createCallContract.contractAddress, // to
      0, // value
      callData, // data
      0, // operation: 0 for CALL, 1 for DELEGATECALL
    ]
  )

  const crossChainCall = await parseBridgeCall({ moduleData, destChainId })

  // parse calls for Safe
  return {
    proposalName: 'Test cross-chain deployment',
    calls: [crossChainCall],
  }
}
