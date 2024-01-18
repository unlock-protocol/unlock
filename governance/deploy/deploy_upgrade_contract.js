const { deployUpgradeableContract, setupDeployer } = require('../utils/zkUtils')
const dotenv = require('dotenv')
const hre = require('hardhat')
const { exec } = require('node:child_process')

dotenv.config()

// FILE EXAMPLE TO DEPLOY A CONTRACT using upgradeable contracts zksync and zkUtils

async function main() {
  const { DEPLOYER_PRIVATE_KEY } = process.env

  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error('Private key not detected! Add it to the .env file!')
  }
  const CONTRACT_NAME = 'MockUSDC'
  const CONTRACT_ARGS = ['oUSDC', 'oUSDC', 18]
  const { deployer, artifact } = setupDeployer(
    'https://sepolia.era.zksync.dev',
    DEPLOYER_PRIVATE_KEY,
    CONTRACT_NAME
  )
  const contract = await deployUpgradeableContract(
    deployer,
    artifact,
    CONTRACT_ARGS
  )
  await contract.waitForDeployment()
  const contractAddress = await contract.getAddress()
  console.log(`Contract deployed at ${contractAddress}`)
  await new Promise((resolve, reject) => {
    exec(
      `npx hardhat verify --network zkSyncSepolia ${contractAddress} --config zkSync.config.ts`,
      (error, stdout, stderr) => {
        if (error) {
          console.warn(error)
          reject(error)
        }
        resolve(stdout ? stdout : stderr)
      }
    )
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
