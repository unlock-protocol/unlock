const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const multisigABI = require('../../test/helpers/ABIs/multisig.json')

async function main({ chainId, safeAddress }) {
  // get the correct provider if chainId is specified
  let provider
  if (chainId) {
    const { publicProvider } = networks[chainId]
    provider = new ethers.providers.JsonRpcProvider(publicProvider)
  } else {
    ;({ provider } = ethers)
  }

  const safe = new ethers.Contract(safeAddress, multisigABI, provider)
  const owners = await safe.getOwners()
  return owners
}

module.exports = main
