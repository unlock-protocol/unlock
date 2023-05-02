const { task } = require('hardhat/config')
const { getNetworkName } = require('../helpers/network')
const { getProxyAdminAddress } = require('../helpers/deployments')

task('upgrade', 'Upgrade an existing contract with a new implementation (no multisig)')
  .addParam('contract', 'The contract path')
  .addParam('proxy', 'The proxy contract address')
  .setAction(async ({ contract, proxy }, { ethers, network }) => {

    const contractName = contract.split('/')[1].replace('.sol', '')
    console.log(`Upgrading ${contractName} contract...`)

    // show signer
    const [signer] = await ethers.getSigners()
    console.log(`Signer: ${signer.address}`)
    
    // fetch proxy admin
    const proxyAdminAddress = await getProxyAdminAddress({ network })
    console.log(`proxyAdminAddress: ${proxyAdminAddress}`)

    // eslint-disable-next-line global-require
    const simpleUpgrade = require(`../scripts/upgrade/simple`)
    await simpleUpgrade({
      proxyAddress: proxy,
      contractName,
    })
  })

task('upgrade:prepare', 'Deploy the implementation of an upgradeable contract')
  .addParam('contract', 'The contract path (default to Unlock)')
  .addOptionalParam('proxy', 'The proxy contract address')
  .addOptionalParam(
    'contractVersion',
    'If set, will fetch the contract version from contracts package'
  )
  .setAction(async ({ contract, proxy, contractVersion }, { ethers, run }) => {
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
      contractVersion
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
  .addParam('proxyAddress', 'The proxy contract address')
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
  .addFlag('addOnly', 'Only add the template without setting it as default')
  .setAction(async ({ publicLockAddress, publicLockVersion, addOnly }) => {
    // eslint-disable-next-line global-require
    const submitLockVersion = require('../scripts/upgrade/submitLockVersion')
    await submitLockVersion({ publicLockAddress, publicLockVersion, addOnly })
  })

task(
  'proxy-admin',
  'Retrieve the proxy admin address'
)
  .addOptionalParam('publicLockAddress', 'The deployed contract address')
  .addOptionalParam(
    'publicLockVersion',
    'Specify the template version to deploy (from contracts package)'
  )
  .setAction(async (_, { ethers, network }) => {
    // eslint-disable-next-line global-require
    const { getProxyAdminAddress } = require('../helpers/deployments')
    const proxyAdminAddress = await getProxyAdminAddress({ network })
    const proxyAdmin = await ethers.getContractAt(
      'TestProxyAdmin',
      proxyAdminAddress
    )
    console.log(`ProxyAdmin at ${proxyAdminAddress} (owner: ${await proxyAdmin.owner()})`)
  })

  