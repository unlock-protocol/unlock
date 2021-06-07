const { constants } = require('hardlydifficult-ethereum-contracts')

module.exports = async ({
  getNamedAccounts,
  deployments
}) => {
  const { get, execute } = deployments;
  const { unlockOwner, proxyAdmin } = await getNamedAccounts();

  // initialize Unlock
  await execute(
    'Unlock', 
    {
      from: proxyAdmin,
      gasLimit: constants.MAX_GAS,
      log: true
    },
    'initialize', // methodName
    unlockOwner // args
  );

  // get PublicLock instance
  // const PublicLock = await getArtifact('PublicLock')
  // console.log(PublicLock);
  const lockTemplate = await get('PublicLock_Implementation')

  console.log('setLockTemplate with PublicLock at', lockTemplate.address);

  // const lockTemplate = await PublicLock.new()
  await execute(
    'Unlock',
    {
      from: unlockOwner,
      gasLimit: constants.MAX_GAS,
      log: true
    },
    'setLockTemplate', // methodName
    lockTemplate.address // args
  );
};

module.exports.tags = ['initalizeUnlock'];