const { ethers, upgrades } = require('hardhat')
const { addDeployment } = require('../../helpers/deployments')

async function main({ locksmiths }) {
  const KeyManager = await ethers.getContractFactory('KeyManager')
  const keyManager = await upgrades.deployProxy(KeyManager, [locksmiths], {
    initializer: 'initialize(address)',
  })
  await keyManager.deployed()

  // TODO: transfer ownership to multisig (based on networks package?)

  // TODO: add verification

  // save deployment info
  await addDeployment('KeyManager', keyManager, true)

  return keyManager.address
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
