const fs = require('fs-extra')
const path = require('path')

const { Manifest } = require('@openzeppelin/upgrades-core')
const { getNetworkName } = require('./network')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

const getProxyData = async ({ networkName, contractName }) => {
  const { proxies } = OZ_SDK_EXPORT.networks[networkName]
  const [proxy] = proxies[`unlock-protocol/${contractName.replace('V2', '')}`]
  return proxy
}

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
  // get ABI etc
  const deploymentFilePath = getDeploymentsFilePath(chainId, contractName)
  const { abi, address, implementationAddress } =
    fs.readJsonSync(deploymentFilePath)

  const networkName = process.env.RUN_MAINNET_FORK
    ? 'mainnet'
    : getNetworkName(chainId)

  const deployment = {
    contractName,
    abi,
    address,
    implementation: implementationAddress,
  }

  // support all networks
  if (networkName !== 'localhost') {
    const {
      address: networkAddress,
      implementation: networkImplementationAddress,
    } = getProxyData(chainId, contractName)

    deployment.address = networkAddress
    deployment.implementation = networkImplementationAddress
  }

  console.log(deployment)
  return deployment
}

const getProxyAddress = function getProxyAddress(chainId, contractName) {
  const { address } = getDeployment(chainId, `${contractName}`)
  if (!address) {
    throw new Error(
      `The proxy address for ${contractName} was not found in the network manifest (chainId: ${chainId})`
    )
  }
  return address
}

const getProxyAdminAddress = async ({ network }) => {
  // get proxy admin address from OZ manifest
  const manifest = await Manifest.forNetwork(network.provider)
  const manifestAdmin = await manifest.getAdmin()
  const proxyAdminAddress = manifestAdmin.address
  if (proxyAdminAddress === undefined) {
    throw new Error('No ProxyAdmin was found in the network manifest')
  }
  return proxyAdminAddress
}

module.exports = {
  getProxyAdminAddress,
  getProxyAddress,
  addDeployment,
  getDeployment,
}
