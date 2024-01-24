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

export default {
  deployContract,
}
