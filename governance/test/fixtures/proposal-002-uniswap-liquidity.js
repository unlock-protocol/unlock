const { ethers } = require('ethers')
const ERC20_ABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/erc20.json')

const WETH_ABI = ['function deposit() payable']
const POSITION_MANAGER_ABI = [
  'function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
]

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
const UP_TOKEN_ADDRESS = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'
const POSITION_MANAGER_ADDRESS = '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'
const TIMELOCK_ADDRESS = '0xB34567C4cA697b39F72e1a8478f285329A98ed1b'

const ETH_AMOUNT = ethers.parseEther('10')
const ETH_MIN_AMOUNT = ethers.parseEther('9.95')
const UP_TOKEN_AMOUNT = ethers.parseEther('6912345')
const UP_TOKEN_MIN_AMOUNT = ethers.parseEther('6877783')
const POOL_FEE = 3000
const FULL_RANGE_LOWER_TICK = -887220
const FULL_RANGE_UPPER_TICK = 887220
const DEADLINE = Math.floor(Date.now() / 1000) + 86400 * 30

module.exports = {
  proposalName: `Add Liquidity to UP/WETH Uniswap Pool

This proposal adds 10 ETH and the corresponding amount of UP tokens to a full-range position in the UP/WETH Uniswap V3 pool on Base.`,
  calls: [
    {
      contractAddress: WETH_ADDRESS,
      contractNameOrAbi: WETH_ABI,
      functionName: 'deposit',
      functionArgs: [],
      value: ETH_AMOUNT,
    },
    {
      contractAddress: WETH_ADDRESS,
      contractNameOrAbi: ERC20_ABI,
      functionName: 'approve',
      functionArgs: [POSITION_MANAGER_ADDRESS, ETH_AMOUNT],
    },
    {
      contractAddress: UP_TOKEN_ADDRESS,
      contractNameOrAbi: ERC20_ABI,
      functionName: 'approve',
      functionArgs: [POSITION_MANAGER_ADDRESS, UP_TOKEN_AMOUNT],
    },
    {
      contractAddress: POSITION_MANAGER_ADDRESS,
      contractNameOrAbi: POSITION_MANAGER_ABI,
      functionName: 'mint',
      functionArgs: [
        {
          token0: WETH_ADDRESS,
          token1: UP_TOKEN_ADDRESS,
          fee: POOL_FEE,
          tickLower: FULL_RANGE_LOWER_TICK,
          tickUpper: FULL_RANGE_UPPER_TICK,
          amount0Desired: ETH_AMOUNT.toString(),
          amount1Desired: UP_TOKEN_AMOUNT.toString(),
          amount0Min: ETH_MIN_AMOUNT.toString(),
          amount1Min: UP_TOKEN_MIN_AMOUNT.toString(),
          recipient: TIMELOCK_ADDRESS,
          deadline: DEADLINE,
        },
      ],
    },
  ],
}
