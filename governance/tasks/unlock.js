const { task } = require('hardhat/config')

task('unlock:info', 'Show the owner of the Unlock contract')
  .addOptionalParam('unlockAddress', 'The address of the Unlock contract')
  .setAction(async ({ unlockAddress }) => {
    // eslint-disable-next-line global-require
    const unlockInfo = require('../scripts/getters/unlock-info')
    await unlockInfo({ unlockAddress })
  })
