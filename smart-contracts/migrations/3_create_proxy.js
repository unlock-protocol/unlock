// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli')

const { create } = scripts
const PublicLock = artifacts.require('PublicLock')

async function deploy(options, accounts) {
  // default account used by ganache
  const unlockOwner = accounts[0]

  // Create an instance of MyContract
  const unlockContract = await create(
    Object.assign(
      {
        contractAlias: 'Unlock',
        methodName: 'initialize',
        methodArgs: [unlockOwner],
      },
      options
    )
  )

  // Deploy lock template
  const lockTemplate = await PublicLock.new()
  let tx = await unlockContract.methods.configUnlock(
    lockTemplate.address,
    '',
    ''
  ).send({ from: unlockOwner })
}

module.exports = function(deployer, networkName, accounts) {
  const proxyAdmin = accounts[9]

  deployer.then(async () => {
    const { network, txParams } = await ConfigManager.initNetworkConfiguration({
      network: networkName,
      from: proxyAdmin,
    })
    txParams.gas = 4000000
    const options = { network, txParams }
    await deploy(options, accounts)
  })
}
