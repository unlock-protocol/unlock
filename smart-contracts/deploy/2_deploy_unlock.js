module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments;
  const { proxyAdmin } = await getNamedAccounts();

  // the following will only deploy if the contract was never deployed or if the code changed since last deployment
  await deploy('Unlock', {
    from: proxyAdmin,
    // gasLimit: 4000000,
    args: [],
    log: true
  });
  

  // TODO: make sure this needs to be added there (not in original truffle migration) ?
  await deploy('PublicLock', {
    from: proxyAdmin,
    // gasLimit: 4000000,
    args: [],
    log: true
  });
};
