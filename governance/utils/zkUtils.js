const { Wallet, Provider } = require('zksync-ethers')
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy')
const hre = require('hardhat')
const ethers = require('ethers')

async function deployContract(deployer, contract, params) {
  const artifact = await deployer.loadArtifact(contract)

  const deploymentFee = await deployer.estimateDeployFee(artifact, params)
  const parsedFee = ethers.formatEther(deploymentFee.toString())
  console.log(`${contract} deployment is estimated to cost ${parsedFee} ETH`)

  return await deployer.deploy(artifact, params)
}

function setupDeployer(url, privateKey) {
  // setup deployer
  const provider = new Provider(url)
  const wallet = new Wallet(privateKey, provider)
  const deployer = new Deployer(hre, wallet)

  return [provider, wallet, deployer]
}

export { deployContract, setupDeployer }
