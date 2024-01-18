const { Wallet, Provider } = require('zksync-ethers')
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy')
const hre = require('hardhat')
const ethers = require('ethers')

async function deployContract(deployer, artifact, params) {
  const deploymentFee = await deployer.estimateDeployFee(artifact, params)
  const parsedFee = ethers.formatEther(deploymentFee.toString())
  console.log(`Deployment is estimated to cost ${parsedFee} ETH`)

  return await deployer.deploy(artifact, params)
}

async function deployUpgradeableContract(deployer, artifact, params) {
  return await hre.zkUpgrades.deployProxy(deployer.zkWallet, artifact, params)
}

function setupDeployer(url, privateKey, contractName) {
  // setup deployer
  const provider = new Provider(url)
  const wallet = new Wallet(privateKey, provider)
  const deployer = new Deployer(hre, wallet)
  const artifact = deployer.loadArtifact(contractName)

  return { provider, wallet, deployer, artifact }
}

export { deployContract, setupDeployer, deployUpgradeableContract }
