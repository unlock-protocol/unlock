const multisigABI = require('../test/helpers/ABIs/multisig.json')

// helpers
const log = (...message) => {
  // eslint-disable-next-line no-console
  console.log('GNOSIS SAFE SETUP >', ...message)
}

// multisig on mainnet
const multisigAddress = '0xa39b44c4AFfbb56b76a1BF1d19Eb93a5DfC2EBA9'

async function main() {
  const multisig = await ethers.getContractAt(multisigABI, multisigAddress)
  const signers = await multisig.getOwners()
  console.log(signers)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
