const Zos = require('zos')
const { ZosPackageFile } = Zos.files
const packageFile = new ZosPackageFile()

let networkFile
let proxies
let mostRecentProxy
let ProxyAddress
let proxiedUnlock

module.exports = function getUnlockProxy (_Unlock, _network) {
  networkFile = packageFile.networkFile(`${_network}`)
  proxies = networkFile.getProxies({ contract: `Unlock` })
  mostRecentProxy = proxies.length - 1
  ProxyAddress = proxies[mostRecentProxy].address

  return _Unlock
    .at(ProxyAddress)
    .then(_proxiedUnlock => {
      proxiedUnlock = _proxiedUnlock
    })
    .then(() => {
      return proxiedUnlock
    })
}
