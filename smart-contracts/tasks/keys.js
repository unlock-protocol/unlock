const { task } = require('hardhat/config')

task('key:renew', 'Renew an expired key')
  .addParam('lockAddress', 'The lock address')
  .addParam('tokenId', 'The ID of the key to renew')
  .addOptionalParam('referrer', 'The address of the referrer')
  .setAction(async ({ lockAddress, tokenId, referrer }) => {
    // eslint-disable-next-line global-require
    const renewKey = require('../scripts/keys/renew')
    await renewKey({ lockAddress, tokenId, referrer })
  })
