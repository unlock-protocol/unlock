const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const multisigOldABI = require('../../test/helpers/ABIs/multisig.json')
const multisigABI = require('../../test/helpers/ABIs/multisig-1.3.0.json')

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

const getSafeVersion = async (safeAddress) => {
  const abi = [
    {
      inputs: [],
      name: 'VERSION',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ]
  const safe = await ethers.getContractAt(abi, safeAddress)
  try {
    const version = await safe.VERSION()
    return version
  } catch (error) {
    return 'old'
  }
}

const getSafe = async ({ safeAddress, signer }) => {
  const { chainId } = await signer.provider.getNetwork()
  if (!safeAddress) {
    safeAddress = getSafeAddress(chainId)
  }
  const version = await getSafeVersion(safeAddress)
  const abi = version !== 'old' ? multisigABI : multisigOldABI
  const safe = new ethers.Contract(safeAddress, abi, signer)
  return safe
}

module.exports = {
  getProvider,
  getSafe,
  getSafeAddress,
  getSafeVersion,
}
