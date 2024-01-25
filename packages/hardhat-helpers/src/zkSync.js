const { Wallet, Provider } = require('zksync-ethers')
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy')
const { getNetwork } = require('./unlock')

const ethers = require('ethers')

export async function deployContract(
  contractNameOrFullyQualifiedName,
  deployArgs = []
) {
  const { deployer } = await zkSyncSetupDeployer()
  const deploymentFee = await deployer.estimateDeployFee(
    contractNameOrFullyQualifiedName,
    deployArgs
  )
  const parsedFee = ethers.formatEther(deploymentFee.toString())
  console.log(`Deployment is estimated to cost ${parsedFee} ETH`)

  const contract = await deployer.deploy(
    contractNameOrFullyQualifiedName,
    deployArgs
  )

  await contract.waitForDeployment()
  const address = await contract.getAddress()
  const { hash } = await contract.deploymentTransaction()

  return {
    contract,
    hash,
    address,
  }
}

export async function deployUpgradeableContract(
  contractNameOrFullyQualifiedName,
  deployArgs = []
) {
  const { zkUpgrades } = require('hardhat')
  const { deployer } = await zkSyncSetupDeployer()

  const contract = await zkUpgrades.deployProxy(
    deployer.zkWallet,
    contractNameOrFullyQualifiedName,
    deployArgs
  )

  await contract.waitForDeployment()
  const contractAddress = await contract.getAddress()
  const { hash } = await contract.deploymentTransaction()

  return {
    contract,
    hash,
    address: contractAddress,
  }
}

async function zkSyncSetupDeployer() {
  const hre = require('hardhat')

  const { id, provider: providerUrl } = await getNetwork()
  console.log(hre.networks[id])
  const { accounts } = hre.networks[id]
  console.log(accounts)

  let privateKey
  if (process.env.DEPLOYER_PRIVATE_KEY) {
    privateKey = process.env.DEPLOYER_PRIVATE_KEY
  } else {
    privateKey = accounts[0].privKey
  }

  // setup deployer
  const provider = new Provider(providerUrl)
  const wallet = new Wallet(privateKey, provider)
  const deployer = new Deployer(hre, wallet)

  return { provider, wallet, deployer }
}

export default {
  deployContract,
  deployUpgradeableContract,
}
