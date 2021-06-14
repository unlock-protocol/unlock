module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments
  const { unlockOwner } = await getNamedAccounts()

  // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
  await deploy('Migrations', {
    from: unlockOwner,
    // gasLimit: 4000000,
    args: [],
    log: true,
  })
}

module.exports.tags = ['Migrations']
