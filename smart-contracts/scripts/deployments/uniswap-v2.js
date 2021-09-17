const { ethers } = require('hardhat')
const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json')
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')

const log = (...message) => {
  // eslint-disable-next-line no-console
  console.log('UNISWAP/WETH SETUP >', ...message)
}

async function main({ wethAddress }) {
  if (!wethAddress) {
    throw new Error('Missing WETH... aborting')
  }

  log(`Using WETH contract at: ${wethAddress}`)

  const [deployer] = await ethers.getSigners()
  const deployerAddress = deployer.address
  log(`Deploying Uniswap contracts using ${deployerAddress}`)

  // Deploy Factory
  const factory = await ethers.getContractFactory(
    UniswapV2Factory.abi,
    UniswapV2Factory.bytecode
  )
  const factoryInstance = await factory.deploy(deployerAddress)
  await factoryInstance.deployed()

  log(`Uniswap V2 Factory deployed to : ${factoryInstance.address}`)

  // Deploy Router passing Factory Address and WETH Address
  const router = await ethers.getContractFactory(
    UniswapV2Router02.abi,
    UniswapV2Router02.bytecode
  )
  const routerInstance = await router.deploy(
    factoryInstance.address,
    wethAddress
  )
  await routerInstance.deployed()

  log(`Router V02 deployed to :  ${routerInstance.address}`)

  return {
    weth: wethAddress,
    factory: factoryInstance.address,
    router: routerInstance.address,
  }
}

// execute as standalone
if (require.main === module) {
  /* eslint-disable promise/prefer-await-to-then, no-console */
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main
