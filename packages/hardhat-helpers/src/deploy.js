import zkSync from './zkSync'

export const deployContract = async (
  contractNameOrFullyQualifiedNameOrEthersFactory,
  deployArgs = [],
  deployOptions = { wait: 1 }
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
  const contract = await Factory.deploy(...deployArgs)
  await contract.waitForDeployment(deployOptions.wait)
  const { hash } = await contract.deploymentTransaction()
  const address = await contract.getAddress()

  return {
    contract,
    hash,
    address,
  }
}

export const deployUpgradeableContract = async (
  contractNameOrFullyQualifiedName,
  deployArgs = [],
  deployOptions = {}
) => {
  const { ethers, upgrades } = require('hardhat')
  const Factory = await ethers.getContractFactory(
    contractNameOrFullyQualifiedName
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
  const implementation = await upgrades.erc1967.getImplementationAddress(
    address
  )

  return {
    contract,
    hash,
    address,
    implementation,
  }
}

export default {
  deployContract: process.env.ZK_SYNC ? zkSync.deployContract : deployContract,
  deployUpgradeableContract: process.env.ZK_SYNC
    ? zkSync.deployUpgradeableContract
    : deployUpgradeableContract,
}
