const { task } = require('hardhat/config')
const { getNetworkName } = require('../helpers/network')
const {
  getProxyAddress,
  getProxyAdminAddress,
} = require('../helpers/deployments')

const getDeploymentInfo = async ({ ethers, contract }) => {
  const contractName = contract.replace('contracts/', '').replace('.sol', '')

  // chainId
  let { chainId } = await ethers.provider.getNetwork()
  if (process.env.RUN_MAINNET_FORK) {
    chainId = 1
  }
  const networkName = getNetworkName(chainId)
  const proxyAddress = getProxyAddress(chainId, contractName)

  return {
    contractName,
    chainId,
    networkName,
    proxyAddress,
  }
}

task('upgrade', 'Upgrade an existing contract with a new implementation')
  .addParam('contract', 'The contract path')
  .setAction(async ({ contract }, { ethers, network }) => {
    const { contractName, networkName, proxyAddress } = await getDeploymentInfo(
      {
        ethers,
        contract,
      }
    )
    const proxyAdminAddress = await getProxyAdminAddress({ network })

    // eslint-disable-next-line no-console
    console.log(
      `Deploying new implementation of ${contractName} on ${networkName}...`
    )

    // eslint-disable-next-line global-require
    const prepareUpgrade = require('../scripts/upgrade/prepare')

    const implementation = await prepareUpgrade({
      proxyAddress,
      contractName,
    })

    // eslint-disable-next-line global-require
    const proposeUpgrade = require('../scripts/upgrade/propose')
    await proposeUpgrade({
      proxyAddress,
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
  .addParam('implementation', 'The implementation contract path')
  .setAction(async ({ contract, implementation }, { ethers, network }) => {
    // get contract deployment info
    const { proxyAddress } = getDeploymentInfo({
      ethers,
      contract,
    })

    const proxyAdminAddress = await getProxyAdminAddress({ network })

    // eslint-disable-next-line global-require
    const proposeUpgrade = require('../scripts/upgrade/propose')
    await proposeUpgrade({
      proxyAddress,
      proxyAdminAddress,
      implementation,
    })
  })
