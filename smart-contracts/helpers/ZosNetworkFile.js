const Zos = require('zos')
const { ZosPackageFile } = Zos.files
const packageFile = new ZosPackageFile()

module.exports = function getNetworkFile(web3) {
  return web3.eth.net.getId().then(_Id => {
    let network
    switch (_Id) {
      case '1':
        network = 'mainnet'
        break
      case '4':
        network = 'rinkeby'
        break
      default:
        network = `dev-${_Id}`
    }
    return packageFile.networkFile(network)
  })
}
