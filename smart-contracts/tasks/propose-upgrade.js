const { task } = require('hardhat/config')
const { Manifest } = require('@openzeppelin/upgrades-core')

/**
 * ex. UDT on mainnet
 * yarn hardhat propose-upgrade --proxy-address 0x90DE74265a416e1393A450752175AED98fe11517 \
 * --implementation xxx
 *
 */

task('propose-upgrade', 'Send an upgrade implementation proposal to multisig')
  .addParam('proxyAddress', 'The proxy contract address')
  .addParam('implementation', 'The implementation contract path')
  .setAction(async ({ proxyAddress, implementation }, { network }) => {
    // parse OZ manifest
    const manifest = await Manifest.forNetwork(network.provider)

    // validate proxy address
    const { proxies } = await manifest.read()
    const [proxy] = proxies.filter((p) => p.address === proxyAddress)
    if (proxy === undefined || proxy.address === undefined) {
      throw new Error(
        `The proxy ${proxyAddress} was not found in the network manifest`
      )
    }

    // get proxy admin address
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
