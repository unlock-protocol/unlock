const { Manifest } = require('@openzeppelin/upgrades-core')

const getProxyAdminAddress = async ({ network }) => {
  // get proxy admin address from OZ manifest
  const manifest = await Manifest.forNetwork(network.provider)
  const manifestAdmin = await manifest.getAdmin()
  const proxyAdminAddress = manifestAdmin.address
  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest')
  }
  return proxyAdminAddress
}

async function getImplementationAddress(proxyAddress) {
  // eslint-disable-next-line global-require
  const { ethers } = require('hardhat')

  const implHex = await ethers.provider.getStorageAt(
    proxyAddress,
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
  )
  return ethers.utils.hexStripZeros(implHex)
}

module.exports = {
  getProxyAdminAddress,
  getImplementationAddress,
}
