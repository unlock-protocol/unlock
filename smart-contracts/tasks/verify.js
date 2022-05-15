const { task } = require('hardhat/config')

task('verify-proxy', 'Deploy and verify the TransparentProxy used by locks')
  .addParam('publicLockAddress', 'the PublicLock template address')
  .addParam('proxyAdminAddress', "Unlock's ProxyAdmin contract address")
  .addOptionalParam(
    'transparentProxyAddress',
    'the address of TransparentProxy instance already deployed using this script'
  )
  .setAction(
    async ({
      publicLockAddress,
      proxyAdminAddress,
      transparentProxyAddress,
    }) => {
      // eslint-disable-next-line global-require
      const verifyProxy = require('../scripts/verify-proxy')
      await verifyProxy({
        publicLockAddress,
        proxyAdminAddress,
        transparentProxyAddress,
      })
    }
  )
