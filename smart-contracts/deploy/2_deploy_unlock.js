module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments;
  const { unlockOwner, proxyAdmin } = await getNamedAccounts();

  // the following will only deploy if the contract was never deployed or if the code changed since last deployment
  const unlock = await deploy('Unlock', {
    contract: 'Unlock',
    from: unlockOwner,
    // gasLimit: 4000000,
    // args: [],
    log: true,
    proxy : {
      owner: proxyAdmin,
      // AdminUpgradeabilityProxy was renamed to TransparentUpgradeableProxy 
      // see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e3661abe84596c8343962fdb35ce612d4bd96480/CHANGELOG.md
      proxyContract: 'OpenZeppelinTransparentProxy',
      // viaAdminContract: 'AdminUpgradeabilityProxy'
    }
  });

  console.log('Unlock (proxy) deployed at', unlock.address);

  // deploy without proxy
  const publicLock = await deploy('PublicLock', {
    contract: 'PublicLock',
    from: unlockOwner,
    log: true
  });

  console.log('PublicLock deployed at', publicLock.address);

};

module.exports.tags = ['Unlock', 'PublicLock'];