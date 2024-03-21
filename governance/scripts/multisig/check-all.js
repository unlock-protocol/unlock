const { networks } = require('@unlock-protocol/networks')
const checkMultisig = require('./check')

async function main() {
  for (let chainId in networks) {
    if (chainId === 31337) return
    await checkMultisig({ chainId })
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
