const { ethers } = require('hardhat')
const { increaseTime } = require('./time')

const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json')
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json')
const UniswapOracle = require('@unlock-protocol/hardhat-helpers/dist/ABIs/UniswapV2Oracle.json')

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
  const factory = await Factory.deploy(await signer.getAddress())

  // Deploy Router passing Factory Address and WETH Address
  const Router = await ethers.getContractFactory(
    UniswapV2Router02.abi,
    UniswapV2Router02.bytecode,
    signer
  )
  const router = await Router.deploy(await factory.getAddress(), wethAddress)
  return router
}

const deployUniswapV2Oracle = async (uniswapFactoryAddress, deployer) => {
  const signer =
    typeof deployer === 'string' ? await ethers.getSigner(deployer) : deployer

  const Oracle = await ethers.getContractFactory(
    UniswapOracle.abi,
    UniswapOracle.bytecode,
    signer
  )
  const oracle = await Oracle.deploy(uniswapFactoryAddress)
  return oracle
}

const createUniswapV2Exchange = async ({
  protocolOwner,
  minter,
  udtAddress,
  amount = ethers.parseEther('1000000'),
}) => {
  const udt = await ethers.getContractAt(
    'UnlockDiscountTokenV3',
    udtAddress,
    minter
  )

  // Deploy the exchange
  const weth = await deployWETH(protocolOwner)
  const uniswapRouter = await deployUniswapV2(
    await weth.getAddress(),
    protocolOwner
  )

  // Create UDT <-> WETH pool
  await udt.mint(await minter.getAddress(), amount)
  await udt.approve(await uniswapRouter.getAddress(), MAX_UINT)

  await uniswapRouter
    .connect(minter)
    .addLiquidityETH(
      await udt.getAddress(),
      amount,
      '1',
      '1',
      await minter.getAddress(),
      MAX_UINT,
      {
        value: ethers.parseEther('40', 'ether'),
      }
    )

  const uniswapOracle = await deployUniswapV2Oracle(
    await uniswapRouter.factory(),
    protocolOwner
  )

  // Advancing one hour to avoid an intermittent test fail
  await increaseTime(3600)

  // Do a swap so there is some data accumulated
  await uniswapRouter
    .connect(minter)
    .swapExactETHForTokens(
      1,
      [await weth.getAddress(), await udt.getAddress()],
      await minter.getAddress(),
      MAX_UINT,
      { value: ethers.parseEther('1') }
    )

  return {
    router: uniswapRouter,
    oracle: uniswapOracle,
    weth,
  }
}

module.exports = {
  deployUniswapV2,
  deployUniswapV2Oracle,
  createUniswapV2Exchange,
}
