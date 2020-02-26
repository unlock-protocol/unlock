// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli')
const { constants } = require('hardlydifficult-ethereum-contracts')

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
  await unlockContract.methods
    .setLockTemplate(lockTemplate.address)
    .send({ from: unlockOwner, gas: constants.MAX_GAS })
}

module.exports = async (deployer, networkName, accounts) => {
  const proxyAdmin = accounts[9]

  const { network, txParams } = await ConfigManager.initNetworkConfiguration({
    network: networkName,
    from: proxyAdmin,
  })
  txParams.gas = constants.MAX_GAS
  const options = { network, txParams }
  await deploy(options, accounts)
}
