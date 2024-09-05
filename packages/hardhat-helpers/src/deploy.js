import { isLocalhost } from './localhost'
import zkSync from './zkSync'
const getContractFactory = async (
  contractNameOrFullyQualifiedNameOrEthersFactory
) => {
  let Factory
  if (typeof contractNameOrFullyQualifiedNameOrEthersFactory === 'string') {
    const { ethers } = require('hardhat')
    Factory = await ethers.getContractFactory(
      contractNameOrFullyQualifiedNameOrEthersFactory
    )
  } else {
    Factory = contractNameOrFullyQualifiedNameOrEthersFactory
  }
  return Factory
}

export const deployContract = async (
  contractNameOrFullyQualifiedNameOrEthersFactory,
  deployArgs = [],
  deployOptions = { wait: 1 }
) => {
  const Factory = await getContractFactory(
    contractNameOrFullyQualifiedNameOrEthersFactory
  )
  const contract = await Factory.deploy(...deployArgs)
  await contract.waitForDeployment(deployOptions.wait)
  const { hash } = await contract.deploymentTransaction()
  const address = await contract.getAddress()
  console.log(` > contract deployed at : ${address} (tx: ${hash})`)

  if (!(await isLocalhost())) {
    const args = {
      address,
      deployArgs,
    }

    // pass fully qualified path for verification
    if (typeof contractNameOrFullyQualifiedNameOrEthersFactory === 'string') {
      args.contract = contractNameOrFullyQualifiedNameOrEthersFactory
    }

    await verify(args)
  }

  return {
    contract,
    hash,
    address,
  }
}

export const deployUpgradeableContract = async (
  contractNameOrFullyQualifiedNameOrEthersFactory,
  deployArgs = [],
  deployOptions = {}
) => {
  const { ethers, upgrades } = require('hardhat')
  const Factory = await getContractFactory(
    contractNameOrFullyQualifiedNameOrEthersFactory
  )
  const contract = await upgrades.deployProxy(
    Factory,
    deployArgs,
    deployOptions
  )
  await contract.waitForDeployment()
  const { hash } = await contract.deploymentTransaction()

  // get addresses
  const address = await contract.getAddress()
  const implementation =
    await upgrades.erc1967.getImplementationAddress(address)

  if (!(await isLocalhost())) {
    await verify({ address, deployArgs })
  }
  console.log(` > contract deployed w proxy at : ${address} (tx: ${hash})`)

  return {
    contract,
    hash,
    address,
    implementation,
  }
}

export const verify = async ({ address, deployArgs, contract }) => {
  const { run } = require('hardhat')
  try {
    await run('verify:verify', {
      address,
      contract,
      constructorArguments: deployArgs,
    })
  } catch (error) {
    console.log(
      `FAIL: Verification failed for contract at ${address} with args : ${deployArgs.toString()}`
    )
    console.log(error)
  }
}

export default {
  deployContract: process.env.ZK_SYNC ? zkSync.deployContract : deployContract,
  deployUpgradeableContract: process.env.ZK_SYNC
    ? zkSync.deployUpgradeableContract
    : deployUpgradeableContract,
  verifyContract: verify,
}
