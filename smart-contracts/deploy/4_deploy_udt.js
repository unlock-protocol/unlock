module.exports = async ({ getNamedAccounts, deployments }) => {
  const {
    unlockOwner,
    // minter,
    proxyAdmin,
  } = await getNamedAccounts()
  const { deploy } = deployments

  const udt = await deploy('UnlockDiscountToken', {
    from: unlockOwner,
    // args : [minter],
    log: true,
    proxy: {
      // methodName: 'initialize',
      owner: proxyAdmin,
      // AdminUpgradeabilityProxy was renamed to TransparentUpgradeableProxy
      // see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e3661abe84596c8343962fdb35ce612d4bd96480/CHANGELOG.md
      proxyContract: 'OpenZeppelinTransparentProxy',
    },
  })

  // eslint-disable-next-line no-console
  console.log(`UDT initialized at: ${udt.address}`)
}

module.exports.tags = ['UDT']
