const Unlock = artifacts.require('./Unlock.sol')
const shell = require('shelljs')

module.exports = function deployProxy (deployer, network, accounts) {
  // default account used by ganache
  const unlockOwner = accounts[0]
  // zos proxy admin can be any account other than accounts[0]
  // see "The transparent proxy pattern": https://blog.zeppelinos.org/the-transparent-proxy-pattern/
  const proxyAdmin = accounts[9]

  deployer.then(() => {
    if (network === 'test') {
      console.log("Skipping proxy creation in 3_create_proxy.js while on network 'test'. Exiting...")
      return deployer.deploy(Unlock, unlockOwner)
    } else {
      if (
        shell.exec(
          `zos create Unlock --init initialize --args ${unlockOwner} --network ${network} --from ${proxyAdmin}`
        ).code !== 0
      ) {
        throw new Error('Migration failed')
      }
    }
  })
}
