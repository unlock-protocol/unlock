export const isLocalhost = async () => {
  const { ethers } = require('hardhat')
  const { chainId } = await ethers.provider.getNetwork()
  return chainId.toString() === '31137' || !!process.env.RUN_FORK
}

export default {
  isLocalhost,
}
