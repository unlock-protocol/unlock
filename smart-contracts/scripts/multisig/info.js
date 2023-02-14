const { ethers } = require('hardhat')
const { getProvider, getSafeAddress } = require('./_helpers')
const oldMultisigABI = require('../../test/helpers/ABIs/multisig.json')
const multisigABI = require('../../test/helpers/ABIs/multisig2.json')
const { getHardhatNetwork } = require('../../helpers/network')

async function main() {
  const networks = getHardhatNetwork()
  for (let network in networks) {
    if (network !== 'localhost') {
      const { chainId } = networks[network]
      const { provider } = await getProvider(chainId)
      const safeAddress = await getSafeAddress(chainId)

      let owners, policy
      if (chainId === 1) {
        const safe = new ethers.Contract(safeAddress, oldMultisigABI, provider)
        owners = await safe.getOwners()
        policy = await safe.required()
      } else {
        const safe = new ethers.Contract(safeAddress, multisigABI, provider)
        owners = await safe.getOwners()
        policy = await safe.getThreshold()
      }

      console.log(
        `# ${network} (${chainId}) - ${policy}/${owners.length} owners\n`
      )
      owners.forEach((o) => console.log(`- ${o}`))
    }
  }
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
