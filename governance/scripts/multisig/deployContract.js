/**
 * This script is used to submit a contract deployment to a Safe multisig
 *
 * Usage:
 *
 * // import this script
 * const submitContractDeployment = require('.')
 *
 * const Dummy = await ethers.getContractFactory('Dummy')
 * const { data: deploymentData } = await Dummy.getDeployTransaction(12n)
 *
 * // submit contract creation tx to multisig
 * await submitContractDeployment({ deploymentData })
 */
const { ethers } = require('hardhat')
const { SafeProvider } = require('@safe-global/protocol-kit')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { getSafeVersion } = require('../../helpers/multisig')
const submitTx = require('./submitTx')

async function main({ deploymentData } = {}) {
  const { provider, multisig } = await getNetwork()
  console.log({ multisig })
  const safeProvider = new SafeProvider({
    provider,
    signer: process.env.DEPLOYER_PRIVATE_KEY,
  })
  const safeVersion = await getSafeVersion(multisig)
  const createCallContract = await safeProvider.getCreateCallContract({
    safeVersion,
  })

  // get deployed tx
  const createCallInterface = new ethers.Interface(
    createCallContract.contractAbi
  )
  const callData = createCallInterface.encodeFunctionData('performCreate', [
    '0',
    deploymentData,
  ])

  const calls = [
    {
      calldata: callData,
      contractAddress: createCallContract.contractAddress,
      value: 0,
    },
  ]

  // submit the calls to the multisig
  const txArgs = {
    safeAddress: multisig,
    tx: calls,
  }
  console.log(txArgs)

  const transactionId = await submitTx(txArgs)
  console.log(
    `TRANSFER > Submitted bump tx to multisig (id: ${transactionId}).`
  )

  // function performCreate2(uint256 value, bytes memory deploymentData, bytes32 salt) public returns(address newContract)
  // function performCreate(uint256 value, bytes memory deploymentData) public returns(address newContract)
  // console.log(createCallContract)
  // const tx = await createCallContract.performCreate([0, deploymentData])
  // console.log(tx)
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
