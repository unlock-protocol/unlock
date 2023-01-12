const { task } = require('hardhat/config')

task('lock:serialize', 'Serialize a lock')
  .addParam('lockAddress', 'The lock address')
  .addParam('serializerAddress', 'The LockSerializer contract address')
  .setAction(async ({ lockAddress, serializerAddress }) => {
    // eslint-disable-next-line global-require
    const serializeLock = require('../scripts/lock/serialize')
    const serialized = await serializeLock({ lockAddress, serializerAddress })
    const json = {}
    Object.keys(serialized)
      .filter((k) => Number.isNaN(Number.parseInt(k))) // remove numbers from array index
      .forEach((k) => {
        json[k] = serialized[k]
      })
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(json, null, 2))
  })

task('lock:managers', 'List all managers for a lock')
  .addParam('lockAddress', 'The lock address')
  .setAction(async ({ lockAddress }) => {
    // eslint-disable-next-line global-require
    const listManagers = require('../scripts/lock/listManagers')
    await listManagers({ lockAddress })
  })

task('lock:clone', 'Redeploy an identical lock')
  .addParam('lockAddress', 'The lock address')
  .addParam('unlockAddress', 'The Unlock contract address')
  .addParam('unlockVersion', 'The version of the Unlock contract')
  .addParam('serializerAddress', 'The LockSerializer contract address')
  .setAction(
    async ({
      lockAddress,
      serializerAddress,
      unlockAddress,
      unlockVersion,
    }) => {
      // eslint-disable-next-line global-require
      const cloneLock = require('../scripts/lock/clone')
      await cloneLock({
        lockAddress,
        serializerAddress,
        unlockAddress,
        unlockVersion,
      })
    }
  )

task('lock:samples', 'Deploy a sample lock')
  .addParam('unlockAddress', 'The Unlock contract address')
  .addOptionalParam('tokenAddress', 'The ERC20 token address')
  .addOptionalParam(
    'unlockVersion',
    'The Unlock version to use to deploy the contract'
  )
  .setAction(async ({ unlockAddress, unlockVersion }) => {
    // eslint-disable-next-line global-require
    const deploySampleLocks = require('../scripts/lock/samples')
    await deploySampleLocks({ unlockAddress, unlockVersion })
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
