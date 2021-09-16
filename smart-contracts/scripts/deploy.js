const { constants } = require('hardlydifficult-ethereum-contracts')
const { ethers, upgrades } = require('hardhat')

const { getNetworkName } = require('../helpers/network')
const { addDeployment } = require('../helpers/deployments')

const { MaxUint256 } = ethers.constants

// TODO: params
const estimatedGasForPurchase = 0
const locksmithHost = process.env.LOCKSMITH_HOST || '127.0.0.1'
const locksmithPort = process.env.LOCKSMITH_PORT || 3000

const premintAmount = '1000000.0' // in ETH, must be a string
let uniswapRouterAddress = null // WETH <> UDT pair
let udtAddress = null
let liquidity = '100.0' // in ETH, must be a string

// helpers
const log = (...message) => {
  // eslint-disable-next-line no-console
  console.log('UNLOCK SETUP >', ...message)
}

const saveDeploymentInfo = async (contractName, data) => {
  await addDeployment(contractName, data, true)
}

async function main() {
  const [deployer, minter] = await ethers.getSigners()

  // fetch chain info
  const chainId = await deployer.getChainId()
  const networkName = getNetworkName(chainId)
  const isLocalNet = networkName === 'localhost'
  log(
    `Deploying contracts on ${networkName} with the account: ${deployer.address}`
  )
  log(`isLocalNet : ${isLocalNet}`)
  log(`Deployment info saved to ./deployments/${networkName}.`)

  // 1. deploying Unlock with a transparent / upgradable proxy
  const Unlock = await ethers.getContractFactory('Unlock')
  const unlock = await upgrades.deployProxy(Unlock, [deployer.address], {
    initializer: 'initialize(address)',
  })
  await unlock.deployed()
  await saveDeploymentInfo('Unlock', unlock)
  log('Unlock proxy deployed to:', unlock.address)

  // 2. deploying PublicLock
  const PublicLock = await ethers.getContractFactory('PublicLock')
  const publicLock = await PublicLock.deploy()
  await saveDeploymentInfo('PublicLock', publicLock)
  log('PublicLock deployed at', publicLock.address)

  // 3. setting lock template
  unlock.setLockTemplate(publicLock.address, {
    from: deployer.address,
    gasLimit: constants.MAX_GAS,
  })
  log('Template set for newly deployed lock')

  // 4. setup UDT
  const UDT = await ethers.getContractFactory('UnlockDiscountTokenV2')
  let udt

  if (!udtAddress) {
    // deploy UDT v2 (upgradable)
    udt = await upgrades.deployProxy(UDT, [minter.address], {
      initializer: 'initialize(address)',
    })
    await udt.deployed()
    await saveDeploymentInfo('UnlockDiscountToken', udt)
    log('UDT (v2) deployed to:', udt.address)

    // pre-mint some UDTs, then delegate mint caps to contract
    udt = udt.connect(minter)
    await udt.mint(deployer.address, ethers.utils.parseEther(premintAmount))
    log(`Pre-minted ${premintAmount} UDT to deployer`)

    await udt.addMinter(unlock.address)
    log('grant minting permissions to the Unlock Contract')

    await udt.renounceMinter()
    log('minter renounced minter role')

    udtAddress = udt.address
  } else {
    // attach existing contract
    udt = UDT.attach(udtAddress)
  }

  // deploy uniswap v2 if needed
  if (!uniswapRouterAddress) {
    // eslint-disable-next-line global-require
    const uniswapDeployer = require('./deploy-uniswap-v2')
    const uniswap = await uniswapDeployer()
    uniswapRouterAddress = uniswap.router
  }

  // add liquidity
  if (liquidity) {
    // eslint-disable-next-line global-require
    const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
    const Router = await ethers.getContractFactory(
      UniswapV2Router02.abi,
      UniswapV2Router02.bytecode
    )
    const uniswapRouter = Router.attach(uniswapRouterAddress)

    await udt
      .connect(deployer)
      .approve(uniswapRouterAddress, ethers.utils.parseEther(liquidity))
    log(`UDT approved Uniswap Router for ${liquidity} ETH`)

    await uniswapRouter.connect(deployer).addLiquidityETH(
      udtAddress,
      ethers.utils.parseEther(liquidity), // pool size
      '1',
      '1',
      deployer.address, // receiver
      MaxUint256, // max timestamp
      { value: ethers.utils.parseEther('10.0') }
    )
    log(`added liquidity to uniswap ${liquidity}`)
  }

  // 6. deploy oracle

  // 5. Config unlock
  unlock.configUnlock(
    udtAddress,
    uniswapRouterAddress,
    estimatedGasForPurchase,
    'UDT',
    `http://${locksmithHost}:${locksmithPort}/api/key/`,
    chainId
  )
  log('unlock configured properly')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
