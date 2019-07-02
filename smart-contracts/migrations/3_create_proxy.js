// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('zos')

const { create } = scripts

async function deploy(options, accounts) {
  // default account used by ganache
  const unlockOwner = accounts[0]

  // Create an instance of MyContract
  await create(
    Object.assign(
      {
        contractAlias: 'Unlock',
        initMethod: 'initialize',
        initArgs: [unlockOwner],
      },
      options
    )
  )
}

module.exports = function(deployer, networkName, accounts) {
  const proxyAdmin = accounts[9]

  deployer.then(async () => {
    const {
      network,
      txParams,
    } = await ConfigManager.initNetworkConfiguration({
      network: networkName,
      from: proxyAdmin,
    })
    txParams.gas = 4000000
    const options = { network, txParams }
    await deploy(options, accounts)
  })
}
