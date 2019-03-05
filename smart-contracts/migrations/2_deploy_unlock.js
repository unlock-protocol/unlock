// Load zos scripts and truffle wrapper function
const { scripts, ConfigVariablesInitializer } = require('zos')
const { add, push, create } = scripts

module.exports = function (deployer, networkName, accounts) {
  deployer.then(async () => {
    const { network, txParams } = await ConfigVariablesInitializer.initNetworkConfiguration({ network: networkName, from: accounts[1] })
    txParams.gas = 4000000
    const options = { network, txParams }

    add({ contractsData: [{ name: 'Unlock', alias: 'Unlock' }] })

    await push(options)

    await create(Object.assign({
      contractAlias: 'Unlock',
      initMethod: 'initialize',
      initArgs: [accounts[9]]
    }, options))
  })
}
