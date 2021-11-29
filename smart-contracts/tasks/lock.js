const { task } = require('hardhat/config')

task('lock:serialize', 'Serialize a lock')
  .addParam('lockAddress', 'The lock address')
  .addParam('serializerAddress', 'The LockSerializer contract address')
  .setAction(async ({ lockAddress, serializerAddress }) => {
    // eslint-disable-next-line global-require
    const serializeLock = require('../scripts/lock/serialize')
    const serialized = await serializeLock({ lockAddress, serializerAddress })
    console.log(serialized)
  })

task('lock:samples', 'Deploy a sample lock')
  .addParam('unlockAddress', 'The Unlock contract address')
  .addOptionalParam('tokenAddress', 'The ERC20 token address')
  .setAction(async ({ unlockAddress }) => {
    // eslint-disable-next-line global-require
    const deploySampleLocks = require('../scripts/lock/samples')
    await deploySampleLocks({ unlockAddress })
  })
