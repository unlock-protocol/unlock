const { ethers } = require('hardhat')

// as per OZ EIP1967 Proxy implementation, this is the keccak-256 hash
// of "eip1967.proxy.admin" subtracted by 1
const ADMIN_SLOT =
  '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'

// get proxy admin address from storage
async function getProxyAdminAddress(contractAddress) {
  const hex = await ethers.provider.send('eth_getStorageAt', [
    contractAddress,
    ADMIN_SLOT,
  ])
  return ethers.stripZerosLeft(hex)
}

module.exports = {
  getProxyAdminAddress,
}
