const { task } = require('hardhat/config')

task('set:template', 'Set PublicLock address in Unlock contract')
  .addParam(
    'publicLockAddress',
    'the address of an existing public Lock contract'
  )
  .addOptionalParam(
    'unlockAddress',
    'the address of an existing Unlock contract'
  )
  .addOptionalParam('unlockVersion', 'the version of Unlock to deploy')
  .setAction(async ({ publicLockAddress, unlockAddress, unlockVersion }) => {
    // eslint-disable-next-line global-require
    const templateSetter = require('../scripts/setters/set-template')
    await templateSetter({
      publicLockAddress,
      unlockAddress,
      unlockVersion,
    })
  })
