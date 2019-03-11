let networkFile
let proxiesArray
let mostRecentProxy
let ProxyAddress
let proxiedUnlock

module.exports = function setUnlockProxy (_Unlock, _network) {
  networkFile = require(`../../zos.${_network}.json`)
  proxiesArray = networkFile.proxies['unlock-protocol/Unlock']
  mostRecentProxy = proxiesArray.length - 1
  ProxyAddress =
    networkFile.proxies['unlock-protocol/Unlock'][mostRecentProxy].address

  return _Unlock
    .at(ProxyAddress)
    .then(_proxiedUnlock => {
      proxiedUnlock = _proxiedUnlock
    })
    .then(() => {
      return proxiedUnlock
    })
}
