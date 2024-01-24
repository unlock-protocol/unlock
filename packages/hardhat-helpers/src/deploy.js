export const deployContract = async (Factory) => {
  const contract = await Factory.deploy()
  await contract.waitForDeployment()
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
