/**
 * Example of a bridged proposal that will be sent across Connext to multisigs
 * on the other side of the network.
 */
const { ethers } = require('hardhat')
const {
  getTokenInfo,
  createOrGetUniswapV3Pool,
  getPoolState,
  getPoolImmutables,
} = require('../helpers/uniswap')
const { nearestUsableTick } = require('@uniswap/v3-sdk')
const JSBI = require('jsbi')

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))

// const daoAddress = '0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591'
const timelockAddress = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'

const fee = 3000
const migratorAddress = '0xA5644E29708357803b5A882D272c41cC0dF92B34' // From https://docs.uniswap.org/contracts/v3/reference/deployments
const udtWethV2poolAddress = '0x9ca8aef2372c705d6848fdda3c1267a7f51267c1'

const poolV2Abi = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function balanceOf(address) external view returns (uint256)',
  'function approve(address,uint256) external',
  'function totalSupply() external view returns (uint256)',
  'function allowance(address, address) external view returns (uint256)',
]

const migratorABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token0',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token1',
        type: 'address',
      },
      {
        internalType: 'uint24',
        name: 'fee',
        type: 'uint24',
      },
      {
        internalType: 'uint160',
        name: 'sqrtPriceX96',
        type: 'uint160',
      },
    ],
    name: 'createAndInitializePoolIfNecessary',
    outputs: [
      {
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'pair', type: 'address' },
          {
            internalType: 'uint256',
            name: 'liquidityToMigrate',
            type: 'uint256',
          },
          { internalType: 'uint8', name: 'percentageToMigrate', type: 'uint8' },
          { internalType: 'address', name: 'token0', type: 'address' },
          { internalType: 'address', name: 'token1', type: 'address' },
          { internalType: 'uint24', name: 'fee', type: 'uint24' },
          { internalType: 'int24', name: 'tickLower', type: 'int24' },
          { internalType: 'int24', name: 'tickUpper', type: 'int24' },
          { internalType: 'uint256', name: 'amount0Min', type: 'uint256' },
          { internalType: 'uint256', name: 'amount1Min', type: 'uint256' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'bool', name: 'refundAsETH', type: 'bool' },
        ],
        internalType: 'struct IV3Migrator.MigrateParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'migrate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

function getTickAtSqrtRatio(sqrtPriceX96) {
  let tick = Math.floor(Math.log((sqrtPriceX96 / Q96) ** 2) / Math.log(1.0001))
  return tick
}

// Calculate the amount of token for lp in v3 pool based on the current tick
const getAmounts = (liquidity, sqrtPriceX96, percentageToMigrate = 100) => {
  const currentTick = getTickAtSqrtRatio(sqrtPriceX96)
  const currentRatio = 1.0001 ** currentTick
  const amount0 = liquidity.mul(percentageToMigrate).div('100')
  const amount1 = ethers.BigNumber.from(`${amount0 * currentRatio}`)
  return {
    amount0,
    amount1,
    currentRatio,
  }
}

module.exports = async () => {
  // set to 10% only for starters
  const percentageToMigrate = 10

  console.log(`Migrate ${percentageToMigrate}% of liquidity from v2 to v3`)

  // parse call data for function call
  const poolV2 = await ethers.getContractAt(poolV2Abi, udtWethV2poolAddress)

  // pool v2 info
  const [token0, token1, [reserve0, reserve1], totalSupply] = await Promise.all(
    [
      poolV2.token0(),
      poolV2.token1(),
      poolV2.getReserves(),
      poolV2.totalSupply(),
    ]
  )

  const [{ symbol: symbol0 }, { symbol: symbol1 }] = await Promise.all([
    await getTokenInfo(token0),
    await getTokenInfo(token1),
  ])

  // how many ERC20 owned by the timelock
  const liquidity = await poolV2.balanceOf(timelockAddress)

  // calculate the share of the entire liquidity for each token
  // to determine the amount of tokens owned by the timelock in the pool
  const lp0 = liquidity.mul(reserve0).div(totalSupply)
  const lp1 = liquidity.mul(reserve1).div(totalSupply)

  // deadline
  const { timestamp } = await ethers.provider.getBlock()
  const deadline = timestamp + 60 * 60 * 24 * 60 // add 60 days for full execution

  // info from pool v3
  const poolV3 = await createOrGetUniswapV3Pool(token0, token1, fee, [
    reserve0,
    reserve1,
  ])

  // calculate ticks
  const { tick: currentTick, sqrtPriceX96 } = await getPoolState(poolV3)
  const { tickSpacing } = await getPoolImmutables(poolV3)

  const tickRange = 2
  let tickLower =
    nearestUsableTick(currentTick, tickSpacing) - tickSpacing * tickRange
  let tickUpper =
    nearestUsableTick(currentTick, tickSpacing) + tickSpacing * tickRange

  if (
    token0 !== (await poolV3.token0()) ||
    token1 !== (await poolV3.token1())
  ) {
    throw new Error(`mismach pool tokens`)
  }

  // Get the amount of liquidity to provide to match current UDT price/tick in v3
  // how many UDT do we need to put in pool with the wETH we currently have
  const { currentRatio, amount0, amount1 } = await getAmounts(
    lp0,
    sqrtPriceX96,
    percentageToMigrate
  )

  // parse (include pool fee?)
  const amount0Min = amount0
  const amount1Min = amount1

  // parse args
  const migrationArgs = {
    pair: udtWethV2poolAddress,
    liquidityToMigrate: liquidity,
    percentageToMigrate,
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    amount0Min,
    amount1Min,
    recipient: timelockAddress,
    deadline,
    refundAsETH: false,
  }

  // get uniswap migrator instance
  const migrator = await ethers.getContractAt(migratorABI, migratorAddress)

  // approve migrator to manipulate pool tokens
  const approvalCalldata = poolV2.interface.encodeFunctionData('approve', [
    migrator.address,
    liquidity,
  ])

  // migrate the tokens
  const migrationCalldata = migrator.interface.encodeFunctionData('migrate', [
    migrationArgs,
  ])

  // return all calls parsed for the DAO to process
  const calls = [
    {
      contractAddress: poolV2.address,
      calldata: approvalCalldata,
      functionName: 'approve',
    },
    {
      contractAddress: migrator.address,
      calldata: migrationCalldata,
      functionName: 'migrate',
    },
  ]
  const proposalName = `Migrating UDT/WETH Liquidity Position from Uniswap v2 pool to v3


### Goal of the proposal

This proposal aims at migrating the liquidity provided by the DAO’s treasury from Uniswap [V2 pool]((https://etherscan.io/address/${
    poolV3.address
  }) to the [V3 pool](https://etherscan.io/address/${
    poolV2.address
  }). The migration will provide more efficient trading and routing capabilities. The process will be split in two proposals, by transferring 10% of the existing position first, followed by the remaining 90%. This is done to reduce fluctuations in UDT price during and after the migration process.


### v2 ${symbol0}/${symbol1} pool 

Address: ${poolV2.address}

Total DAO's liquidity tokens in V2 pool: 
- ${ethers.utils.formatEther(lp0)} ${symbol0}
- ${ethers.utils.formatEther(lp1)} ${symbol1}

Current trading price in v2 pool
- 1 ${symbol0} = ${reserve1 / reserve0} ${symbol1}
- 1 ${symbol1} = ${reserve0 / reserve1} ${symbol0}

### v3 ${symbol0}/${symbol1} pool 

Address: ${poolV3.address}

Current trading price in v3 pool: 
- 1 ${symbol0} = ${currentRatio} ${symbol1}
- 1 ${symbol1} = ${1 / currentRatio} ${symbol0}

To match the difference in price btw the v2 and v3 pool, we need to add liquidity at the current v3 rate.

The liquidity tokens to add to v3 pool to migrate ${percentageToMigrate}% of the pool: 
- (${symbol0}) : ${ethers.utils.formatEther(
    amount0.toString()
  )} ${symbol0} (${amount0})
- (${symbol1}) : ${ethers.utils.formatEther(
    amount1.toString()
  )} ${symbol1} (${amount1})


### About the proposal

The two calls contained in the proposal are as follow

1) set approval on v2 pool to allow Uniswap migrator contract to manipulate the existing position \`approve(
  ${migrator.address},
  ${liquidity})\`

2) call the \`migrator.migrate\` function to carry out the migration with the following arguments:

${Object.keys(migrationArgs)
  .map((k) => `- ${k}: ${migrationArgs[k]}`)
  .join('\n')}
  
Once approved and executed, the proposal will create a position in the Uniswap V3 pool and a NFT represented the position will be sent to the dao timelock.

Thank you!`

  console.log(proposalName)
  console.log(calls)

  // const txs = calls.map((c) => ({
  //   call: c.calldata,
  //   to: c.contractAddress,
  //   from: timelockAddress,
  // }))
  // console.log(txs)
  // await Promise.all(txs.map((tx) => signer.sendTransaction(tx)))

  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
