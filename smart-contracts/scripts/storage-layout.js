const hre = require('hardhat')

async function main() {
  await hre.storageLayout.export()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
