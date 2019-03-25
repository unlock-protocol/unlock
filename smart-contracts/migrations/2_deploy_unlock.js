// Load zos scripts and truffle wrapper function
const { scripts, ConfigVariablesInitializer } = require('zos')
const { add, push } = scripts

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
    txParams.gas = 4000000
    const options = { network, txParams }

    await zosDeploy(options)
  })
}
