const getNetworkFile = require('../../helpers/ZosNetworkFile.js')

let proxies
let mostRecentProxy
let ProxyAddress
let proxiedUnlock

module.exports = function getUnlockProxy(_Unlock) {
  return getNetworkFile(web3).then(networkFile => {
    proxies = networkFile.getProxies({ contract: 'Unlock' })
    mostRecentProxy = proxies.length - 1
    ProxyAddress = proxies[mostRecentProxy].address
    return _Unlock.at(ProxyAddress).then(_proxiedUnlock => {
      proxiedUnlock = _proxiedUnlock
      return proxiedUnlock
    })
  })
}
