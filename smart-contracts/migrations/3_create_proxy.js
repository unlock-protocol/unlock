// Load zos scripts and truffle wrapper function
const { scripts, ConfigVariablesInitializer } = require('zos')
const { create } = scripts

async function deploy (options, accounts) {
  // default account used by ganache
  const unlockOwner = accounts[0]

  // Create an instance of MyContract
  await create(
    Object.assign(
      {
        contractAlias: 'Unlock',
        initMethod: 'initialize',
        initArgs: [unlockOwner]
      },
      options
    )
  )
}

module.exports = function (deployer, networkName, accounts) {
  const proxyAdmin = accounts[9]

  deployer.then(async () => {
    const {
      network,
      txParams
    } = await ConfigVariablesInitializer.initNetworkConfiguration({
      network: networkName,
      from: proxyAdmin
    })
    txParams.gas = 4000000
    const options = { network, txParams }

    if (networkName === 'test' || networkName === 'development') {
      console.log(
        `Skipping proxy creation in 3_create_proxy.js while on network '${network}'. Exiting...`
      )
    } else {
      await deploy(options, accounts)
    }
  })
}
