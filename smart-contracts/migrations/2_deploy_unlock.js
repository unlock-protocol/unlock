// Load zos scripts and truffle wrapper function
const { scripts, ConfigVariablesInitializer } = require('zos')
const { add, push, create } = scripts

module.exports = function (deployer, networkName, accounts) {
  deployer.then(async () => {
    const { network, txParams } = await ConfigVariablesInitializer.initNetworkConfiguration({ network: networkName, from: accounts[1] })
    txParams.gas = 4000000
    const options = { network, txParams }
    // Register v0 of MyContract in the zos project
    add({ contractsData: [{ name: 'Unlock', alias: 'Unlock' }] })

    // Push implementation contracts to the network
    await push(options)

    // Create an instance of MyContract, setting initial value to 42
    await create(Object.assign({
      contractAlias: 'Unlock',
      initMethod: 'initialize',
      initArgs: [accounts[9]]
    }, options))
  })
}
