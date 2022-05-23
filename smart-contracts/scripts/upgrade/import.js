const { ethers, upgrades } = require('hardhat')

// used to update contract implementation address in proxy admin using multisig
async function main({ proxyAddress, contractName }) {
  const Contract = await ethers.getContractFactory(contractName)
  const implementation = await upgrades.forceImport(proxyAddress, Contract)

  console.log(`${contractName} implementation imported.`)

  return implementation
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
