/* eslint-disable global-require */
const { ethers } = require('hardhat')
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const { getNetworkName } = require('../../helpers/network')

const { MaxUint256 } = ethers.constants

const log = (...message) => {
  // eslint-disable-next-line no-console
  console.log('UNLOCK DEPLOYMENT >', ...message)
}

async function main({
  premintAmount, // in ETH, must be a string
  liquidity, // in ETH, must be a string
  unlockAddress,
  udtAddress,
  publicLockAddress,
  wethAddress,
  uniswapRouterAddress,
  uniswapFactoryAddress,
  oracleAddress,
  estimatedGasForPurchase,
  locksmithURI,
}) {
  let unlock
  let udt

  const [deployer, minter] = await ethers.getSigners()

  // fetch chain info
  const chainId = await deployer.getChainId()
  const networkName = getNetworkName(chainId)
  const isLocalNet = networkName === 'localhost'
  log(
    `Deploying contracts on ${networkName} with the account: ${deployer.address}`
  )
  log(`isLocalNet : ${isLocalNet}`)

  if (!unlockAddress) {
    // deploying Unlock with a transparent / upgradable proxy
    const unlockDeployer = require('./unlock')
    unlockAddress = await unlockDeployer()
  }

  // get unlock instance
  const Unlock = await ethers.getContractFactory('Unlock')
  unlock = Unlock.attach(unlockAddress)

  // deploying PublicLock
  if (!publicLockAddress) {
    const publicLockDeployer = require('./template')
    publicLockAddress = await publicLockDeployer()
  }

  // set lock template
  const templateSetter = require('../setters/set-template')
  await templateSetter({
    publicLockAddress,
    unlockAddress,
  })

  // deploy UDT
  if (!udtAddress) {
    // deploy UDT v2 (upgradable)
    const udtDeployer = require('./udt')
    udtAddress = await udtDeployer()
  }

  // attach existing contract instance
  const UDT = await ethers.getContractFactory('UnlockDiscountTokenV2')
  udt = UDT.attach(udtAddress)

  // pre-mint some UDTs, then delegate mint caps to contract
  if (premintAmount) {
    udt = udt.connect(minter)
    await udt.mint(deployer.address, ethers.utils.parseEther(premintAmount))
    log(`Pre-minted ${premintAmount} UDT to deployer`)

    await udt.addMinter(unlockAddress)
    log('grant minting permissions to the Unlock Contract')

    await udt.renounceMinter()
    log('minter renounced minter role')
  }

  // deploy WETH
  if (!wethAddress) {
    const WETH = {
      mainnet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      ropsten: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      rinkeby: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      goerli: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
      kovan: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
    }

    if (!Object.keys(WETH).includes(networkName)) {
      const wethDeployer = require('./weth')
      wethAddress = await wethDeployer()
      log(`WETH deployed to : ${wethAddress}`)
    } else {
      wethAddress = WETH[networkName]
      log(`using WETH at: ${wethAddress}`)
    }
  }

  // deploy uniswap v2 if needed
  if (!uniswapFactoryAddress) {
    const uniswapDeployer = require('./uniswap-v2')
    const uniswap = await uniswapDeployer({ wethAddress })
    uniswapRouterAddress = uniswap.router
    uniswapFactoryAddress = uniswap.factory
  }

  // get uniswap instance
  const Router = await ethers.getContractFactory(
    UniswapV2Router02.abi,
    UniswapV2Router02.bytecode
  )
  const uniswapRouter = Router.attach(uniswapRouterAddress)
  uniswapFactoryAddress = await uniswapRouter.factory()

  // add liquidity
  if (liquidity) {
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

  // config unlock
  const unlockConfigSetter = require('../setters/unlock-config')
  await unlockConfigSetter({
    unlockAddress,
    udtAddress,
    wethAddress,
    estimatedGasForPurchase,
    locksmithURI,
  })

  // deploy oracle if needed
  if (!oracleAddress) {
    const oracleDeployer = require('./oracle')
    oracleAddress = await oracleDeployer({
      uniswapFactoryAddress,
    })
  }

  await unlock.connect(deployer).setOracle(udtAddress, oracleAddress)
  log('Oracle address set in Unlock:', oracleAddress)
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
