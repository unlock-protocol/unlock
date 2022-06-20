const { ethers } = require('hardhat')
const { time } = require('@openzeppelin/test-helpers')

const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json')
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const UniswapOracle = require('./ABIs/UniswapOracle.json')

const { deployWETH } = require('./tokens')
const { MAX_UINT } = require('./constants')

const deployUniswapV2 = async (wethAddress, deployer) => {
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer

  // Deploy Factory
  const Factory = await ethers.getContractFactory(
    UniswapV2Factory.abi,
    UniswapV2Factory.bytecode,
    signer
  )
  const factory = await Factory.deploy(signer.address)
  await factory.deployed()

  // Deploy Router passing Factory Address and WETH Address
  const Router = await ethers.getContractFactory(
    UniswapV2Router02.abi,
    UniswapV2Router02.bytecode,
    signer
  )
  const router = await Router.deploy(factory.address, wethAddress)
  await router.deployed()

  return router
}

const deployUniswapOracle = async (uniswapFactoryAddress, deployer) => {
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer

  const Oracle = await ethers.getContractFactory(
    UniswapOracle.abi,
    UniswapOracle.bytecode,
    signer
  )
  const oracle = await Oracle.deploy(uniswapFactoryAddress)
  await oracle.deployed()

  return oracle
}

const createExchange = async ({
  protocolOwner,
  minter,
  udtAddress,
  amount = ethers.utils.parseEther('1000000'),
}) => {
  const udt = await ethers.getContractAt(
    'UnlockDiscountTokenV3',
    udtAddress,
    minter
  )

  // Deploy the exchange
  const weth = await deployWETH(protocolOwner)
  const uniswapRouter = await deployUniswapV2(weth.address, protocolOwner)

  // Create UDT <-> WETH pool
  await udt.mint(minter.address, amount)
  await udt.approve(uniswapRouter.address, MAX_UINT)

  await uniswapRouter
    .connect(minter)
    .addLiquidityETH(udt.address, amount, '1', '1', minter.address, MAX_UINT, {
      value: ethers.utils.parseEther('40', 'ether'),
    })

  const uniswapOracle = await deployUniswapOracle(
    await uniswapRouter.factory(),
    protocolOwner
  )

  // Advancing time to avoid an intermittent test fail
  await time.increase(time.duration.hours(1))

  // Do a swap so there is some data accumulated
  await uniswapRouter
    .connect(minter)
    .swapExactETHForTokens(
      1,
      [weth.address, udt.address],
      minter.address,
      MAX_UINT,
      { value: ethers.utils.parseEther('1') }
    )

  return {
    router: uniswapRouter,
    oracle: uniswapOracle,
    weth,
  }
}

module.exports = {
  deployUniswapV2,
  deployUniswapOracle,
  createExchange,
}
