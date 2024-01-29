export const isLocalhost = async () => {
  const { ethers } = require('hardhat')
  const { chainId } = await ethers.provider.getNetwork()
  return chainId.toString() === '31337' && !process.env.RUN_FORK
}

export default {
  isLocalhost,
}
