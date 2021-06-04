const getProxiesbyNetwork = require('../../helpers/getProxiesbyNetwork.js')
module.exports = async function getProxy(contractArtifact) {
  
  console.log("yooo");
  
  const proxies = await getProxiesbyNetwork(web3)
  
  const contractName = `unlock-protocol/${contractArtifact.contractName}`
  console.log(proxies);
  console.log(proxies[contractName]);
  console.log(proxies[contractName].address);

  const proxyAddress = proxies[contractName].address
  return await contractArtifact.at(proxyAddress)
}
