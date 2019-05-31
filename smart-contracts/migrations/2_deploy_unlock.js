// Load zos scripts and truffle wrapper function
const { scripts, ConfigVariablesInitializer } = require('zos')

const { add, push } = scripts
const Unlock = artifacts.require('Unlock')
const PublicLock = artifacts.require('PublicLock')

async function zosDeploy(options) {
  // Register Unlock in the zos.json
  add({ contractsData: [{ name: 'Unlock', alias: 'Unlock' }] })
  // Push implementation contract to the network
  await push(options)
}

module.exports = function deployUnlock(deployer, networkName, accounts) {
  const proxyAdmin = accounts[9]

  deployer.then(async () => {
    const {
      network,
      txParams,
    } = await ConfigVariablesInitializer.initNetworkConfiguration({
      network: networkName,
      from: proxyAdmin,
    })
    const options = { network, txParams }

    await zosDeploy(options)

    // Bytecode entries end with a platform specific hash of metadata
    // so we remove that before hashing, allowing these logs to be used
    // to verify versions in the future.
    // eslint-disable-next-line no-console
    console.log(
      `Deployed bytes4(keccak256(bytecode.substring(0, bytecode.length - 64)))
  Unlock.bytecode: ${Unlock.bytecode}
  Unlock.deployedBytecode: ${Unlock.deployedBytecode}
  PublicLock.bytecode: ${PublicLock.bytecode}
  PublicLock.deployedBytecode: ${PublicLock.deployedBytecode}`
    )
  })
}
