const { run, upgrades, ethers } = require('hardhat')

const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
  isLocalhost,
} = require('@unlock-protocol/hardhat-helpers')

// used to update contract implementation address in proxy admin
async function main({ proxyAddress, contractName, contractVersion }) {
  // need to fetch previous
  let Contract
  if (contractVersion) {
    console.log(`Setting up version ${contractVersion} from package`)
    await copyAndBuildContractsAtVersion(__dirname, [
      {
        contractName,
        version: contractVersion,
      },
    ])
    Contract = await ethers.getContractFactory(
      `contracts/past-versions/${contractName}V${contractVersion}.sol:${contractName}`
    )
  } else {
    throw Error('Need a version number --unlock-version')
  }

  let implementation
  try {
    implementation = await upgrades.prepareUpgrade(proxyAddress, Contract, {
      kind: 'transparent',
    })
  } catch (error) {
    if (error.message.includes('is not registered')) {
      console.log('Importing missing layout of previous impl...')
    }
    await copyAndBuildContractsAtVersion(__dirname, [
      {
        contractName,
        version: contractVersion - 1,
      },
    ])
    const PreviousContract = await ethers.getContractFactory(
      `contracts/past-versions/${contractName}V${
        contractVersion - 1
      }.sol:${contractName}`
    )

    // import previous layout
    await upgrades.forceImport(proxyAddress, PreviousContract, {
      kind: 'transparent',
    })

    // deploy the new implementation
    implementation = await upgrades.prepareUpgrade(proxyAddress, Contract, {
      kind: 'transparent',
    })
  }

  console.log(`${contractName} implementation deployed at: ${implementation}`)

  if (!(await isLocalhost())) {
    await run('verify:verify', {
      address: implementation,
    })
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
