const { task } = require('hardhat/config')
const { getImplementationAddress } = require('@openzeppelin/upgrades-core')

task('node:reset', 'Reser node state').setAction(async () => {
  // eslint-disable-next-line global-require
  const { resetNodeState } = require('../test/helpers/mainnet')
  await resetNodeState()
  // eslint-disable-next-line no-console
  console.log('Node state reset OK.')
})

task('impl', 'Get the contract implementation address')
  .addParam('proxyAddress', 'The proxy contract path')
  .setAction(async ({ proxyAddress }, { network }) => {
    const impl = await getImplementationAddress(network.provider, proxyAddress)
    if (impl) {
      console.log(`> implementation address: ${impl}`)
    } else {
      console.log(`No implementation found.`)
    }
  })
