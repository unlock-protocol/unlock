const Zos = require('zos')
const { ZosPackageFile } = Zos.files
const packageFile = new ZosPackageFile()

let networkFile
let proxies
let mostRecentProxy
let ProxyAddress
let proxiedUnlock
let network

module.exports = function getUnlockProxy (_Unlock) {
  return web3.eth.net
    .getId()
    .then(_Id => {
      switch (_Id) {
        case '1984':
          network = 'dev-1984'
          break
        case '4':
          network = 'rinkeby'
          break
        default:
          network = 'dev-1984'
      }
    })
    .then(() => {
      networkFile = packageFile.networkFile(`${network}`)
      proxies = networkFile.getProxies({ contract: `Unlock` })
      mostRecentProxy = proxies.length - 1
      ProxyAddress = proxies[mostRecentProxy].address
      return _Unlock.at(ProxyAddress)
    })
    .then(_proxiedUnlock => {
      proxiedUnlock = _proxiedUnlock
      return proxiedUnlock
    })
}
