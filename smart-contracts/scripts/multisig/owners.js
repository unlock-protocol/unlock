const { ethers } = require('hardhat')
const { getProvider, getSafeAddress } = require('./_helpers')
const multisigABI = require('../../test/helpers/ABIs/multisig.json')

async function main({ chainId, safeAddress }) {
  const { provider } = await getProvider(chainId)
  if (!safeAddress) {
    safeAddress = await getSafeAddress(chainId)
  }
  const safe = new ethers.Contract(safeAddress, multisigABI, provider)
  const owners = await safe.getOwners()
  return owners
}

module.exports = main
