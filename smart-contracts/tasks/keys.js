const { task } = require('hardhat/config')

task('key:renew', 'Renew an expired key')
  .addParam('lockAddress', 'The lock address')
  .addParam('tokenId', 'The ID of the key to renew')
  .addOptionalParam('referrer', 'The address of the referrer')
  .setAction(async ({ lockAddress, tokenId, referrer }) => {
    const renewKey = require('../scripts/keys/renew')
    await renewKey({ lockAddress, tokenId, referrer })
  })
