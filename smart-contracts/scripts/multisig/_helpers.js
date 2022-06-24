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
const getSafeAddress = async (provider, chainId) => {
  if (!chainId) {
    ;({ chainId } = await provider.getNetwork())

    // make sure we can use it in tests
    if (process.env.RUN_MAINNET_FORK) {
      chainId = 1
    }
  }

  //get unlock contract
  const { unlockAddress } = networks[chainId]
  const { interface } = await ethers.getContractFactory('Unlock')
  const unlock = new ethers.Contract(unlockAddress, interface, provider)

  // get address
  const safeAddress = await unlock.owner()
  return safeAddress
}

const getSafe = async ({ safeAddress, signer }) => {
  if (!safeAddress) {
    safeAddress = await getSafeAddress(signer.provider)
  }
  const safe = new ethers.Contract(safeAddress, multisigABI, signer)
  return safe
}

module.exports = {
  getProvider,
  getSafe,
  getSafeAddress,
}
