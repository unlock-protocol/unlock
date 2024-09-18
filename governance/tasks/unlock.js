const { task } = require('hardhat/config')
const { networks } = require('@unlock-protocol/networks')
const { getProxyAdminAddress } = require('@unlock-protocol/hardhat-helpers')

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

      console.log(`Deploying new implementation of Unlock on ${chainId}.`)

      // deploy upgrade
      if (!impl) {
        const prepareUpgrade = require('../scripts/upgrade/prepare')
        impl = await prepareUpgrade({
          proxyAddress: unlockAddress,
          contractName: 'Unlock',
          contractVersion: unlockVersion,
        })
      }

      if (!proxyAdminAddress) {
        proxyAdminAddress = await getProxyAdminAddress({ chainId })
      }

      const proposeUpgrade = require('../scripts/upgrade/propose')
      await proposeUpgrade({
        proxyAddress: unlockAddress,
        proxyAdminAddress,
        multisig,
        implementation: impl,
      })
    }
  )

task('unlock:prepare', 'Deploy an implementaton of the Unlock contract')
  .addOptionalParam(
    'unlockVersion',
    'The version of the implementation to deploy'
  )
  .addOptionalParam('unlockAddress', 'The address of the Unlock contract')
  .setAction(async ({ unlockVersion, unlockAddress }, { ethers }) => {
    const { chainId } = await ethers.provider.getNetwork()

    if (!unlockAddress) {
      ;({ unlockAddress } = networks[chainId])
    }

    console.log(`Deploying new implementation of Unlock on ${chainId}.`)

    const prepareUpgrade = require('../scripts/upgrade/prepare')

    await prepareUpgrade({
      proxyAddress: unlockAddress,
      contractName: 'Unlock',
      contractVersion: unlockVersion,
    })
  })

task('unlock:info', 'Show the owner of the Unlock contract')
  .addOptionalParam('unlockAddress', 'The address of the Unlock contract')
  .addFlag('quiet', 'Show only errors')
  .setAction(async ({ unlockAddress, quiet }) => {
    const unlockInfo = require('../scripts/getters/unlock-info')
    await unlockInfo({ unlockAddress, quiet })
  })
