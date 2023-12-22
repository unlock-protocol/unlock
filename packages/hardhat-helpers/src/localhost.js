export const isLocalhost = async () => {
  const { ethers } = require('hardhat')
  const { chainId } = await ethers.provider.getNetwork()
  return chainId.toString() === '31137'
}

export default {
  isLocalhost,
}
