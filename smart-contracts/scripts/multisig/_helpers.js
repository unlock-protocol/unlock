const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const multisigABI = require('../../test/helpers/ABIs/multisig.json')

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
const getSafeAddress = async (chainId) => {
  const { multisig } = networks[chainId]
  return multisig
}

const getSafe = async ({ safeAddress, signer }) => {
  const { chainId } = await signer.provider.getNetwork()
  if (!safeAddress) {
    safeAddress = getSafeAddress(chainId)
  }
  const safe = new ethers.Contract(safeAddress, multisigABI, signer)
  return safe
}

module.exports = {
  getProvider,
  getSafe,
  getSafeAddress,
}
