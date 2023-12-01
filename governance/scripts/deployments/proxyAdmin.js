const { upgrades } = require('hardhat')

async function main() {
  const proxyAdminAddress = await upgrades.deployProxyAdmin()
  console.log(`ProxyAdmin deployed at: ${proxyAdminAddress}`)
  return proxyAdminAddress
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
