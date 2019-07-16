const UnlockDiscountToken = artifacts.require('UnlockDiscountToken')

const { scripts } = require('zos')

const { add, create, push } = scripts

module.exports = async function(deployer, networkName, accounts) {
  const proxyAdmin = accounts[9]

  // Register Unlock in the zos.json
  add({
    contractsData: [
      { name: 'UnlockDiscountToken', alias: 'UnlockDiscountToken' },
    ],
  })
  // Push implementation contract to the network
  await push({
    network: networkName,
    from: proxyAdmin,
  })
  await create({
    contractAlias: 'UnlockDiscountToken',
    methodName: 'initialize',
    methodArgs: [],
    network: networkName,
    from: proxyAdmin,
  })
}
