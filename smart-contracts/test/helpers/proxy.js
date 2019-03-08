const dev1984 = require('../../zos.dev-1984.json')
const proxiesArray = dev1984.proxies['unlock-protocol/Unlock']
// Get the last (most recent) entry
const mostRecentProxy = proxiesArray.length - 1
const ProxyAddress =
  dev1984.proxies['unlock-protocol/Unlock'][mostRecentProxy].address
// use the packaged ABI here?
const Unlock = artifacts.require('../Unlock.sol')

let unlock

module.exports = function setUnlockProxy () {
  return Unlock.at(ProxyAddress)
    .then(_unlock => {
      unlock = _unlock
    })
    .then(() => {
      return unlock
    })
}
