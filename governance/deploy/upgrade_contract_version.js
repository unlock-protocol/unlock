const dotenv = require('dotenv')
const hre = require('hardhat')
const { setupDeployer } = require('../utils/zkUtils')

dotenv.config()

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || ''

const PROXY_ADDRESS = 'PROXY_ADDRESS_HERE'

if (!DEPLOYER_PRIVATE_KEY) {
  throw '⛔️ Private key not detected! Add it to the .env file!'
}

const VERSION = 'V2'

const CONTRACT_NAME = 'YourContractName'

async function main() {
  const { deployer, artifact } = setupDeployer(
    'https://sepolia.era.zksync.dev',
    DEPLOYER_PRIVATE_KEY,
    CONTRACT_NAME
  )

  console.log('Deployer account address: ', deployer.zkWallet.address)

  const newContractVersion = await deployer.loadArtifact(
    `${CONTRACT_NAME}${VERSION}`
  )

  await hre.zkUpgrades.upgradeProxy(
    deployer.zkWallet,
    PROXY_ADDRESS,
    newContractVersion
  )

  console.log(`${CONTRACT_NAME} upgraded to =>  ${CONTRACT_NAME}${VERSION}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
