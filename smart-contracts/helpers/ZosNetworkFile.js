const Zos = require('@openzeppelin/cli')

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
    return new Zos.files.NetworkFile(new Zos.files.ProjectFile(), network)
  })
}
