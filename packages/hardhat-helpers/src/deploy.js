export const deployContract = async (
  Factory,
  deployArgs = [],
  deployOptions = { wait: 1 }
) => {
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
  Factory,
  deployArgs = [],
  deployOptions = {}
) => {
  const { upgrades } = require('hardhat')
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
  deployContract,
  deployUpgradeableContract,
}
