const { ethers, upgrades } = require('hardhat')

const {
  copyAndBuildContractAtVersion,
  cleanupContractVersions
} = require('../upgrade/_helpers')

// used to update contract implementation address in proxy admin using multisig
async function main({ proxyAddress, contractName, contractVersion }) {

  // need to fetch previous 
  let Contract 
  if (contractVersion) {
    console.log(`Setting up version ${contractVersion} from package`)
    Contract = await copyAndBuildContractAtVersion(contractName, contractVersion)
  } else {
    console.log(`Deploying development version of Unlock from local source code. Please pass a version number if you want to deploy from a stable release.`)
    Contract = await ethers.getContractFactory('contracts/Unlock.sol:Unlock')
  }

  const implementation = await upgrades.prepareUpgrade(proxyAddress, Contract)

  console.log(`${contractName} implementation deployed at: ${implementation}`)

  if(contractVersion) {
    await cleanupContractVersions()
  }
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
