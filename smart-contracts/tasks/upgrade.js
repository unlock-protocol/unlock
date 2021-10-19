const { task } = require('hardhat/config')
const { Manifest } = require('@openzeppelin/upgrades-core')
const { getNetworkName } = require('../helpers/network')
const { getDeployment } = require('../helpers/deployments')
const { getProxyAddress } = require('../helpers/proxy')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

task('upgrade:prepare', 'Deploy the implementation of an upgreadable contract')
  .addParam('contract', 'The contract path')
  .setAction(async ({ contract }, { ethers, upgrades }) => {
    const { chainId } = await ethers.provider.getNetwork()
    const contractName = contract.replace('contracts/', '').replace('.sol', '')

    const networkName = process.env.RUN_MAINNET_FORK
      ? 'mainnet'
      : getNetworkName(chainId)

    // eslint-disable-next-line no-console
    console.log(`Deploying new implementation on ${networkName}...`)

    const proxyAddress = getProxyAddress(chainId, contractName)

    const Contract = await ethers.getContractFactory(contractName)
    const implementation = await upgrades.prepareUpgrade(proxyAddress, Contract)

    // eslint-disable-next-line no-console
    console.log(`${contractName} implementation deployed at: ${implementation}`)
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
    const { chainId } = await ethers.provider.getNetwork()
    const contractName = contract.replace('contracts/', '').replace('.sol', '')

    // validate proxy address
    const proxyAddress = getProxyAddress(chainId, contractName)

    // get proxy admin address from OZ manifest
    const manifest = await Manifest.forNetwork(network.provider)
    const manifestAdmin = await manifest.getAdmin()
    const proxyAdminAddress = manifestAdmin?.address
    if (proxyAdminAddress === undefined) {
      throw new Error('No ProxyAdmin was found in the network manifest')
    }

    // eslint-disable-next-line global-require
    const proposeUpgrade = require('../scripts/multisig/propose-upgrade')
    await proposeUpgrade({
      proxyAddress,
      proxyAdminAddress,
      implementation,
    })
  })
