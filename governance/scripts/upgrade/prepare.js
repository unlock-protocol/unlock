const { run, upgrades } = require('hardhat')

const {
  copyAndBuildContractsAtVersion,
  cleanupContractVersions,
} = require('@unlock-protocol/hardhat-helpers')

// used to update contract implementation address in proxy admin
async function main({ proxyAddress, contractName, contractVersion }) {
  // need to fetch previous
  let Contract
  if (contractVersion) {
    console.log(`Setting up version ${contractVersion} from package`)
    ;[Contract] = await copyAndBuildContractsAtVersion(__dirname, [
      {
        contractName,
        version: contractVersion,
      },
    ])
  } else {
    throw Error('Need a version number --unlock-version')
  }

  const implementation = await upgrades.prepareUpgrade(proxyAddress, Contract, {
    kind: 'transparent',
  })

  console.log(`${contractName} implementation deployed at: ${implementation}`)

  await run('verify:verify', {
    address: implementation,
  })

  if (contractVersion) {
    await cleanupContractVersions(__dirname)
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
