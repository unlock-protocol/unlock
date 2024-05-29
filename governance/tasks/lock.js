const { task } = require('hardhat/config')

task('lock:managers', 'List all managers for a lock')
  .addParam('lockAddress', 'The lock address')
  .setAction(async ({ lockAddress }) => {
    // eslint-disable-next-line global-require
    const listManagers = require('../scripts/lock/listManagers')
    await listManagers({ lockAddress })
  })

task('lock:samples', 'Deploy a sample lock')
  .addOptionalParam('unlockAddress', 'The Unlock contract address')
  .addOptionalParam('tokenAddress', 'The ERC20 token address')
  .addOptionalParam(
    'lockVersion',
    'The PublicLock version to use when deploying the lock'
  )
  .addOptionalParam('count', 'The number of sample locks to deploy')
  .setAction(async ({ unlockAddress, lockVersion, count }) => {
    // eslint-disable-next-line global-require
    const deploySampleLocks = require('../scripts/lock/samples')
    await deploySampleLocks({ unlockAddress, lockVersion, lockCount: count })
  })

task('lock:create', 'Deploy a lock')
  .addOptionalParam('price', 'The price')
  .addOptionalParam('name', 'The name of the lock')
  .addOptionalParam('duration', 'The duration')
  .addOptionalParam('maxNumberOfKeys', 'The max number of keys available')
  .addOptionalParam('tokenAddress', 'The ERC20 token address')
  .addOptionalParam(
    'lockVersion',
    'The PublicLock version to use to deploy the contract'
  )
  .setAction(
    async ({
      price,
      duration,
      maxNumberOfKeys,
      tokenAddress,
      lockVersion,
      name,
    }) => {
      // eslint-disable-next-line global-require
      const createLock = require('../scripts/lock/create')
      await createLock({
        price,
        duration,
        tokenAddress,
        maxNumberOfKeys,
        lockVersion,
        name,
      })
    }
  )

task('lock:upgrade', 'Upgrade a lock to the next version')
  .addParam('lockAddress', 'The lock address')
  .setAction(async ({ lockAddress }) => {
    // eslint-disable-next-line global-require
    const upgradeLock = require('../scripts/lock/upgrade')
    await upgradeLock({ lockAddress })
  })

task('lock:purchase', 'Purchase a single key')
  .addParam('lockAddress', 'The lock address')
  .addOptionalParam('to', 'The address that will receive the key')
  .addOptionalParam(
    'lockVersion',
    'The version of the Lock used to deploy the keys'
  )
  .setAction(async ({ lockAddress }) => {
    // eslint-disable-next-line global-require
    const upgradeLock = require('../scripts/lock/purchase')
    await upgradeLock({ lockAddress })
  })
