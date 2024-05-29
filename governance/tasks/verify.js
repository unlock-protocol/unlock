const { task } = require('hardhat/config')
const fs = require('fs-extra')
const path = require('path')

const contractsPath = path.resolve(
  __dirname,
  '..',
  'contracts',
  'past-versions'
)
const artifactsPath = path.resolve(
  __dirname,
  '..',
  'artifacts',
  'contracts',
  'past-versions'
)

task('verify-proxy', 'Deploy and verify the TransparentProxy used by locks')
  .addParam('lockAddress', 'the PublicLock template address')
  .addOptionalParam('unlockAddress', 'the Unlock factory address')
  .addOptionalParam('creationTx', 'the tx hash of lock creation')
  .addOptionalParam('deployNew', 'deploy and verify a new lock')
  .setAction(async ({ lockAddress, unlockAddress, creationTx, deployNew }) => {
    // eslint-disable-next-line global-require
    const verifyProxy = require('../scripts/verify/proxy')
    await verifyProxy({
      lockAddress,
      unlockAddress,
      creationTx,
      deployNew,
    })
  })

task('verify-template', 'Verify the PublicLock at specific version')
  .addParam('publicLockAddress', 'the PublicLock template address')
  .addParam('publicLockVersion', 'the PublicLock version to verify')
  .setAction(async ({ publicLockAddress, publicLockVersion }, { run }) => {
    if (publicLockVersion) {
      const contractPath = `@unlock-protocol/contracts/dist/PublicLock/PublicLockV${publicLockVersion}.sol`

      await fs.copy(
        require.resolve(contractPath),
        path.resolve(contractsPath, `PublicLockV${publicLockVersion}.sol`)
      )
    }
    await run('verify:verify', {
      address: publicLockAddress,
    })

    if (publicLockVersion) {
      await fs.remove(contractsPath)
      await fs.remove(artifactsPath)
    }
  })
