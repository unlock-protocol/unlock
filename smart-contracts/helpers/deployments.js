const fs = require('fs-extra')
const path = require('path')

const { getNetworkName } = require('./network')

const deploymentsPath = path.resolve(__dirname, '../deployments')

const getDeploymentsFolder = (chainId) => {
  // parse network name
  const networkName = getNetworkName(chainId)
  const deployFolderPath = path.join(deploymentsPath, networkName)

  // create folder it if it doesnt exist
  fs.ensureDirSync(deployFolderPath)

  return deployFolderPath
}

const getDeploymentsFilePath = (chainId, contractName) => {
  const deploymentFolder = getDeploymentsFolder(chainId)
  const deploymentPath = path.join(deploymentFolder, `${contractName}.json`)
  return deploymentPath
}

async function getImplementationAddress(proxyAddress) {
  // eslint-disable-next-line global-require
  const { ethers } = require('hardhat')

  const implHex = await ethers.provider.getStorageAt(
    proxyAddress,
    '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
  )
  return ethers.utils.hexStripZeros(implHex)
}

const parseDeploymentInfo = async (contractName, instance, isProxy) => {
  // eslint-disable-next-line global-require
  const { artifacts } = require('hardhat')
  const artifact = await artifacts.readArtifact(contractName)
  const receipt = await instance.deployTransaction.wait()

  const deployment = {
    ...artifact,
    receipt,
    address: instance.address,
    txAddress: instance.deployTransaction.hash,
    chainId: instance.deployTransaction.chainId,
    from: instance.deployTransaction.from,
    blockNumber: instance.deployTransaction.blockNumber,
  }

  if (isProxy) {
    const implementationAddress = await getImplementationAddress(
      instance.address
    )
    deployment.isProxy = true
    deployment.implementationAddress = implementationAddress
  }

  return deployment
}

const addDeployment = async (contractName, instance, isProxy) => {
  // parse data
  const deployment = await parseDeploymentInfo(contractName, instance, isProxy)

  // parse path
  const deploymentFilePath = getDeploymentsFilePath(
    deployment.chainId,
    contractName
  )

  // save as JSON
  fs.outputJsonSync(deploymentFilePath, deployment, { spaces: 2 })

  return { ...deployment, path: deploymentFilePath }
}

const getDeployment = (chainId, contractName) => {
  const deploymentFilePath = getDeploymentsFilePath(chainId, contractName)
  return fs.readJsonSync(deploymentFilePath)
}

module.exports = {
  addDeployment,
  getDeployment,
}
