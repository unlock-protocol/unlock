const { scripts, ConfigManager } = require('zos')

const { add, create, push } = scripts

module.exports = async function(deployer, networkName, accounts) {
  const proxyAdmin = accounts[9]

  const { network, txParams } = await ConfigManager.initNetworkConfiguration({
    network: networkName,
    from: proxyAdmin,
  })

  // Register Unlock in the zos.json
  await add({
    contractsData: [
      {
        name: 'UnlockDiscountToken',
        alias: 'UnlockDiscountToken',
        network,
        txParams,
      },
    ],
  })
  // Push implementation contract to the network
  await push({
    network: networkName,
    from: proxyAdmin,
    network,
    txParams,
  })
  await create({
    contractAlias: 'UnlockDiscountToken',
    methodName: 'initialize',
    methodArgs: [],
    from: proxyAdmin,
    network,
    txParams,
  })
}
