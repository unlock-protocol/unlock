module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments;
  const { unlockOwner, proxyAdmin } = await getNamedAccounts();

  // the following will only deploy if the contract was never deployed or if the code changed since last deployment
  await deploy('Unlock', {
    from: unlockOwner,
    // gasLimit: 4000000,
    args: [],
    log: true,
    proxy : {
      owner: proxyAdmin,
      // AdminUpgradeabilityProxy was renamed to TransparentUpgradeableProxy 
      // see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e3661abe84596c8343962fdb35ce612d4bd96480/CHANGELOG.md
      proxyContract: 'OpenZeppelinTransparentProxy',
    }
  });
  

  // TODO: make sure this needs to be added there (not in original truffle migration) ?
  await deploy('PublicLock', {
    from: unlockOwner,
    // gasLimit: 4000000,
    args: [],
    log: true,
    proxy: {
      owner: proxyAdmin,
      // AdminUpgradeabilityProxy was renamed to TransparentUpgradeableProxy 
      // see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e3661abe84596c8343962fdb35ce612d4bd96480/CHANGELOG.md
      proxyContract: 'OpenZeppelinTransparentProxy',
    }
  });
};

module.exports.tags = ['Unlock', 'PublicLock'];