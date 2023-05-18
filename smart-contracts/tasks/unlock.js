const { task } = require('hardhat/config')
const { networks } = require('@unlock-protocol/networks')
const { getProxyAdminAddress } = require('../helpers/deployments')

task('unlock:info', 'Show the owner of the Unlock contract')
  .addOptionalParam('unlockAddress', 'The address of the Unlock contract')
  .setAction(async ({ unlockAddress }) => {
    // eslint-disable-next-line global-require
    const unlockInfo = require('../scripts/getters/unlock-info')
    await unlockInfo({ unlockAddress })
  })

task(
  'unlock:upgrade',
  'Deploy a new version of the Unlock contract and submit to multisig'
)
  .addOptionalParam('unlockAddress', 'The address of the Unlock contract')
  .addOptionalParam(
    'unlockVersion',
    'The version of the implementation to deploy'
  )
  .addOptionalParam('impl', 'The address of the implementation contract')
  .addOptionalParam('multisig', 'The address of the Safe multisig')
  .addOptionalParam(
    'proxyAdminAddress',
    'The address of the proxy admin that manages upgradeability for the Unlock contract'
  )
  .setAction(
    async (
      { unlockAddress, unlockVersion, impl, multisig, proxyAdminAddress },
      { ethers, network }
    ) => {
      const { chainId } = await ethers.provider.getNetwork()

      if (!unlockAddress) {
        ;({ unlockAddress } = networks[chainId])
      }

      // eslint-disable-next-line no-console
      console.log(`Deploying new implementation of Unlock on ${chainId}.`)

      // deploy upgrade
      if (!impl) {
        // eslint-disable-next-line global-require
        const prepareUpgrade = require('../scripts/upgrade/prepare')
        impl = await prepareUpgrade({
          proxyAddress: unlockAddress,
          contractName: 'Unlock',
          contractVersion: unlockVersion,
        })
      }

      if (!proxyAdminAddress) {
        proxyAdminAddress = await getProxyAdminAddress({ network })
      }

      // eslint-disable-next-line global-require
      const proposeUpgrade = require('../scripts/upgrade/propose')
      await proposeUpgrade({
        proxyAddress: unlockAddress,
        proxyAdminAddress,
        multisig,
        implementation: impl,
      })
    }
  )

task('unlock:execMultisig', 'Submit a tx to the Unlock Owner through multisig')
  .addOptionalParam('unlockAddress', 'an instance of the Unlock contract')
  .addOptionalParam(
    'unlockOwnerAddress',
    'an instance of the UnlockOwner contract'
  )
  .addOptionalParam('multisig', 'a multisig contract')
  .addOptionalParam('calldata', 'the calldata to be executed by Unlock')
  .setAction(async ({ unlockAddress, unlockOwnerAddress, multisig }) => {
    const execMultisig = require('../scripts/manager/execMultisig')
    await execMultisig({ unlockAddress, unlockOwnerAddress, multisig })
  })
