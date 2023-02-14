const { UNLOCK_ADDRESS } = require('../test/helpers')

async function main() {
  console.log(UNLOCK_ADDRESS)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
