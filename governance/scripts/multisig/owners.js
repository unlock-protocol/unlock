const { ethers } = require('hardhat')
const { getProvider, getSafeAddress } = require('../../helpers/multisig')
const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig.json')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')

async function main({ chainId, safeAddress }) {
  if (!chainId) {
    ;({ chainId } = await getNetwork())
  }
  const { provider } = await getProvider(chainId)
  if (!safeAddress) {
    safeAddress = await getSafeAddress(chainId)
  }
  const safe = new ethers.Contract(safeAddress, multisigABI, provider)
  const owners = await safe.getOwners()
  return owners
}

module.exports = main
