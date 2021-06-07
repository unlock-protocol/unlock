const { getProxyAddress } = require('../../helpers/network.js')

module.exports = async function getProxy(contractArtifact) {
  const proxyAddress = await getProxyAddress(web3, contractArtifact.contractName)
  return await contractArtifact.at(proxyAddress)
}
