const { Wallet, Provider } = require('zksync-ethers')
const { getNetwork } = require('./unlock')
const { Deployer } = require('@matterlabs/hardhat-zksync-deploy/dist/deployer')
const ethers = require('ethers')

export async function deployContract(
  contractNameOrFullyQualifiedName,
  deployArgs = []
) {
  const { deployer } = await zkSyncSetupDeployer()
  const artifact = await deployer.loadArtifact(contractNameOrFullyQualifiedName)

  const deploymentFee = await deployer.estimateDeployFee(artifact, deployArgs)
  const parsedFee = ethers.formatEther(deploymentFee.toString())
  console.log(`Deployment is estimated to cost ${parsedFee} ETH`)

  const contract = await deployer.deploy(artifact, deployArgs)

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
  deployArgs = [],
  deployOptions = {}
) {
  const { zkUpgrades } = require('hardhat')
  const { deployer } = await zkSyncSetupDeployer()
  const artifact = await deployer.loadArtifact(contractNameOrFullyQualifiedName)

  const contract = await zkUpgrades.deployProxy(
    deployer.zkWallet,
    artifact,
    deployArgs,
    deployOptions
  )

  await contract.waitForDeployment()
  const contractAddress = await contract.getAddress()
  const { hash } = contract.deployTransaction

  return {
    contract,
    hash,
    address: contractAddress,
  }
}

async function zkSyncSetupDeployer() {
  const hre = require('hardhat')

  // set provider and accounts
  const { chainId, accounts } = hre.network.config
  const { provider: providerUrl } = await getNetwork(chainId)
  const provider = new Provider(providerUrl)
  let wallet
  if (process.env.DEPLOYER_PRIVATE_KEY) {
    wallet = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider)
  } else {
    wallet = Wallet.fromMnemonic(accounts.mnemonic, provider)
  }

  // set deployer
  const deployer = new Deployer(hre, wallet)

  return { provider, wallet, deployer }
}

export default {
  deployContract,
  deployUpgradeableContract,
}
