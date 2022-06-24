const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')

// get the correct provider if chainId is specified
const getProvider = async (chainId) => {
  let provider
  if (chainId) {
    const { publicProvider } = networks[chainId]
    provider = new ethers.providers.JsonRpcProvider(publicProvider)
  } else {
    ;({ provider } = ethers)
    ;({ chainId } = await provider.getNetwork())
  }
  return { provider, chainId }
}

// get safeAddress directly from unlock if needed
const getSafeAddress = async (provider) => {
  const { chainId } = await provider.getNetwork()
  const { unlockAddress } = networks[chainId]

  const { interface } = await ethers.getContractFactory('Unlock')
  const unlock = new ethers.Contract(unlockAddress, interface, provider)
  const safeAddress = await unlock.owner()
  return safeAddress
}

module.exports = {
  getProvider,
  getSafeAddress,
}
