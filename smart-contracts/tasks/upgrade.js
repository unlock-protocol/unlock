const { task } = require('hardhat/config')
const { getNetworkName } = require('../helpers/network')
const { getProxyAdminAddress } = require('../helpers/deployments')

task('upgrade', 'Upgrade an existing contract with a new implementation')
  .addParam('contract', 'The contract path')
  .addParam('proxy', 'The proxy contract address')
  .setAction(async ({ contract, proxy }, { network }) => {
    const contractName = contract.split('/')[1].replace('.sol', '')
    const proxyAdminAddress = await getProxyAdminAddress({ network })

    // eslint-disable-next-line no-console
    console.log(`Deploying new implementation of ${contractName}...`)

    // eslint-disable-next-line global-require
    const prepareUpgrade = require('../scripts/upgrade/prepare')

    const implementation = await prepareUpgrade({
      proxyAddress: proxy,
      contractName,
    })

    // eslint-disable-next-line global-require
    const proposeUpgrade = require('../scripts/upgrade/propose')
    await proposeUpgrade({
      proxyAddress: proxy,
      proxyAdminAddress,
      implementation,
    })
  })

task('upgrade:prepare', 'Deploy the implementation of an upgreadable contract')
  .addParam('contract', 'The contract path')
  .addParam('proxy', 'The proxy contract address')
  .setAction(async ({ contract, proxy }, { ethers, run }) => {
    // first compile latest version
    await run('compile')

    const { chainId } = await ethers.provider.getNetwork()
    const networkName = getNetworkName(chainId)

    // eslint-disable-next-line no-console
    console.log(`Deploying new implementation ${contract} on ${networkName}.`)

    // eslint-disable-next-line global-require
    const prepareUpgrade = require('../scripts/upgrade/prepare')
    const contractName = contract.split('/')[1].replace('.sol', '')
    await prepareUpgrade({
      proxyAddress: proxy,
      contractName,
    })
  })

task('upgrade:import', 'Import a missing impl manifest from a proxy contract')
  .addParam('contract', 'The contract path')
  .addParam('proxy', 'The proxy contract address')
  .setAction(async ({ contract, proxy }, { ethers, run }) => {
    // first compile latest version
    await run('compile')

    const { chainId } = await ethers.provider.getNetwork()
    const networkName = getNetworkName(chainId)

    // eslint-disable-next-line no-console
    console.log(`Importing implementations from ${contract} on ${networkName}.`)

    // eslint-disable-next-line global-require
    const prepareUpgrade = require('../scripts/upgrade/import')
    const contractName = contract.split('/')[1].replace('.sol', '')
    await prepareUpgrade({
      proxyAddress: proxy,
      contractName,
    })
  })

/**
 *
 * ex. UDT on mainnet
 * yarn hardhat propose-upgrade --proxy-address 0x90DE74265a416e1393A450752175AED98fe11517 \
 * --implementation xxx
 *
 */

task('upgrade:propose', 'Send an upgrade implementation proposal to multisig')
  .addParam('contract', 'The contract path')
  .addParam('proxy-address', 'The proxy contract address')
  .addParam('implementation', 'The implementation contract path')
  .setAction(async ({ proxyAddress, implementation }, { network }) => {
    const proxyAdminAddress = await getProxyAdminAddress({ network })

    // eslint-disable-next-line global-require
    const proposeUpgrade = require('../scripts/upgrade/propose')
    await proposeUpgrade({
      proxyAddress,
      proxyAdminAddress,
      implementation,
    })
  })

task(
  'submit:version',
  'Send txs to multisig to add and set new PublicLock version'
)
  .addOptionalParam('publicLockAddress', 'The deployed contract address')
  .addOptionalParam(
    'publicLockVersion',
    'Specify the template version to deploy (from contracts package)'
  )
  .setAction(async ({ publicLockAddress, publicLockVersion }) => {
    // eslint-disable-next-line global-require
    const prepareLockUpgrade = require('../scripts/upgrade/submitLockVersion')
    await prepareLockUpgrade({ publicLockAddress, publicLockVersion })
  })
