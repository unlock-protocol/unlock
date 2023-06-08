const { task } = require('hardhat/config')
const fs = require('fs-extra')
const path = require('path')

// files path
const LATEST_PUBLIC_LOCK_VERSION = 13

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
  .addOptionalParam('publicLockAddress', 'the PublicLock template address')
  .addOptionalParam('unlockAddress', 'the Unlock factory address')
  .addOptionalParam('lockVersion', 'the version number of deployed lock')
  .addOptionalParam('proxyAdminAddress', "Unlock's ProxyAdmin contract address")
  .addOptionalParam('calldata', 'calldata used for lock creation')
  .addOptionalParam(
    'transparentProxyAddress',
    'the address of TransparentProxy instance already deployed using this script'
  )
  .setAction(
    async ({
      calldata,
      lockVersion,
      publicLockAddress,
      proxyAdminAddress,
      transparentProxyAddress,
      unlockAddress,
    }) => {
      // eslint-disable-next-line global-require
      const verifyProxy = require('../scripts/verify-proxy')
      await verifyProxy({
        calldata,
        lockVersion,
        publicLockAddress,
        proxyAdminAddress,
        transparentProxyAddress,
        unlockAddress,
      })
    }
  )

task('verify-template', 'Verify the PublicLock at specific version')
  .addParam('publicLockAddress', 'the PublicLock template address')
  .addOptionalParam('publicLockVersion', 'the PublicLock version to verify')
  .setAction(async ({ publicLockAddress, publicLockVersion }, { run }) => {
    if (publicLockVersion != LATEST_PUBLIC_LOCK_VERSION) {
      const contractPath = `@unlock-protocol/contracts/dist/PublicLock/PublicLockV${publicLockVersion}.sol`

      await fs.copy(
        require.resolve(contractPath),
        path.resolve(contractsPath, `PublicLockV${publicLockVersion}.sol`)
      )
    }
    await run('verify:verify', {
      address: publicLockAddress,
    })

    if (publicLockVersion != LATEST_PUBLIC_LOCK_VERSION) {
      await fs.remove(contractsPath)
      await fs.remove(artifactsPath)
    }
  })
