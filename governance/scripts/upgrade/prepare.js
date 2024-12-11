const { run, upgrades, ethers } = require('hardhat')

const {
  copyAndBuildContractsAtVersion,
  isLocalhost,
} = require('@unlock-protocol/hardhat-helpers')

// used to update contract implementation address in proxy admin
async function main({ proxyAddress, contractName, contractVersion }) {
  // need to fetch previous
  if (!contractVersion) {
    throw Error('Need a version number')
  }

  console.log(
    `Setting up ${contractName} version ${contractVersion} from package`
  )
  const [qualifiedPath] = await copyAndBuildContractsAtVersion(__dirname, [
    {
      contractName,
      version: contractVersion,
    },
  ])
  const Contract = await ethers.getContractFactory(qualifiedPath)

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
        version: BigInt(contractVersion) - 1n,
      },
    ])
    const PreviousContract = await ethers.getContractFactory(
      `contracts/past-versions/${contractName}V${
        BigInt(contractVersion) - 1n
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
