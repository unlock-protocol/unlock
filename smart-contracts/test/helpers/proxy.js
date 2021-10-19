const { getProxyAddress } = require('../../helpers/proxy.js')

module.exports = async function getProxy(contractArtifact) {
  const chainId = await web3.eth.net.getId()
  const proxyAddress = await getProxyAddress(
    chainId,
    contractArtifact.contractName
  )
  return await contractArtifact.at(proxyAddress)
}
