const getNetworkFile = require('../../helpers/ZosNetworkFile.js')

module.exports = async function getProxy(contractArtifact) {
  const networkFile = await getNetworkFile(web3)
  const proxies = networkFile.getProxies({
    contract: contractArtifact.contractName,
  })
  const mostRecentProxy = proxies.length - 1
  const proxyAddress = proxies[mostRecentProxy].address
  return await contractArtifact.at(proxyAddress)
}
