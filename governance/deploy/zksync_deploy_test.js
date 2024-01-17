const { deployContract, setupDeployer } = require('../utils/zkUtils')
const dotenv = require('dotenv')
const hre = require('hardhat')

dotenv.config()

// FILE EXAMPLE TO DEPLOY A CONTRACT using zksync and zkUtils

async function main() {
  const { DEPLOYER_PRIVATE_KEY } = process.env

  if (!DEPLOYER_PRIVATE_KEY) {
    throw new Error('Private key not detected! Add it to the .env file!')
  }
  const CONTRACT_NAME = 'MockUSDC'
  const [_, __, deployer] = setupDeployer(
    'https://sepolia.era.zksync.dev',
    DEPLOYER_PRIVATE_KEY
  )
  const token = await deployContract(deployer, 'MockUSDC', [
    'oUSDC',
    'oUSDC',
    18,
  ])
  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()
  console.log(`MockUSDC deployed at ${tokenAddress}`)
  await hre.run('verify:verify', {
    address: tokenAddress,
    contract: `contracts/mocks/${CONTRACT_NAME}.sol:${CONTRACT_NAME}`,
    constructorArguments: ['oUSDC', 'oUSDC', 18],
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
