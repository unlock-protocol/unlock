// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli')

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
    const { network, txParams } = await ConfigManager.initNetworkConfiguration({
      network: networkName,
      from: proxyAdmin,
    })
    const options = { network, txParams }

    await zosDeploy(options)

    // eslint-disable-next-line no-console
    console.log(
      `Deployed bytes4(keccak256(bytecode))
  Unlock.bytecode: ${this.web3.utils
    .keccak256(Unlock.bytecode)
    .substring(0, 10)}
  Unlock.deployedBytecode: ${this.web3.utils
    .keccak256(Unlock.deployedBytecode)
    .substring(0, 10)}
  PublicLock.bytecode: ${this.web3.utils
    .keccak256(PublicLock.bytecode)
    .substring(0, 10)}
  PublicLock.deployedBytecode: ${this.web3.utils
    .keccak256(PublicLock.deployedBytecode)
    .substring(0, 10)}`
    )
  })
}
