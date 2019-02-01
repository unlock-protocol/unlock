const Unlock = artifacts.require('./Unlock.sol')
const shell = require('shelljs')

module.exports = function deployProxy (deployer, network, accounts) {
  const unlockOwner = accounts[0]
  const proxyAdmin = accounts[9]

  deployer.then(() => {
    if (network === 'test' || network === 'development') {
      return deployer.deploy(Unlock, unlockOwner)
    } else {
      if (
        shell.exec(
          `zos push --reset --network ${network} --from ${proxyAdmin}`
        ).code !== 0
      ) {
        throw new Error('Migration failed')
      }
    }
  })
}
