const deployContracts = require('../fixtures/deploy.js')

module.exports = async function getContractInstance(contractArtifact) {
  const contracts = await deployContracts()
  const { contractName } = contractArtifact
  const contractAddress =
    contracts[contractName.charAt(0).toLowerCase() + contractName.slice(1)]
      .address
  return await contractArtifact.at(contractAddress)
}
