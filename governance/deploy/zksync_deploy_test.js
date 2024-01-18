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
  const CONTRACT_ARGS = ['oUSDC', 'oUSDC', 18]
  const { deployer, artifact } = setupDeployer(
    'https://sepolia.era.zksync.dev',
    DEPLOYER_PRIVATE_KEY,
    CONTRACT_NAME
  )
  const token = await deployContract(deployer, artifact, CONTRACT_ARGS)
  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()
  console.log(`Contract deployed at ${tokenAddress}`)
  await hre.run('verify:verify', {
    address: tokenAddress,
    contract: `contracts/mocks/${CONTRACT_NAME}.sol:${CONTRACT_NAME}`,
    constructorArguments: CONTRACT_ARGS,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
