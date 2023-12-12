/**
 * Example of a bridged proposal that will be sent across Connext to multisigs
 * on the other side of the network.
 */
const { ethers } = require('hardhat')
const { getTokenInfo } = require('../helpers/uniswap')

// const daoAddress = '0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591'
const timelockAddress = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'

// 50% only for starters
const percentageToMigrate = 50
const multisigAddress = '0xc3F2bcBE6fB42faC83dd8a42893C6c0B3809e070'
const udtWethV2poolAddress = '0x9ca8aef2372c705d6848fdda3c1267a7f51267c1'

const poolV2Abi = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function balanceOf(address) external view returns (uint256)',
  'function transfer(address,uint256) external view',
  'function approve(address,uint256) external',
  'function totalSupply() external view returns (uint256)',
  'function allowance(address, address) external view returns (uint256)',
]

module.exports = async () => {
  console.log(
    `Migrate ${percentageToMigrate}% of liquidity from v2 to multisig`
  )

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

  // amount of LP tokens to transfer
  const amountToTransfer = liquidity.mul('50').div('100')

  // encode transfer call
  const transferCalldata = poolV2.interface.encodeFunctionData('transfer', [
    multisigAddress,
    amountToTransfer,
  ])

  // return all calls parsed for the DAO to process
  const calls = [
    {
      contractAddress: poolV2.address,
      calldata: transferCalldata,
      functionName: 'transfer', // explainer
    },
  ]
  const proposalName = `Migrating UDT/WETH Liquidity Position from Uniswap v2 pool


### Goal of the proposal

This proposal aims at moving the liquidity provided by the DAO’s treasury from Uniswap [V2 pool]((https://etherscan.io/address/${
    poolV2.address
  }) to a multisig owned by trustees, so the liquidity can be migrated later on the v3 pool.


### v2 ${symbol0}/${symbol1} pool 

Address: ${poolV2.address}

DAO's liquidity in V2 pool: 
- total : ${liquidity.toString()}
- to transfer: ${amountToTransfer.toString()}

For reference, the total DAO's liquidity in V2 pool is: 
- ${ethers.utils.formatEther(lp0)} ${symbol0}
- ${ethers.utils.formatEther(lp1)} ${symbol1}


### About the proposal

The proposal contains a single call that will transfer half of tht liquidity tokens
to the multisig.

Once approved and executed, the tokens will be transferred.

Thank you!`

  console.log(proposalName)
  console.log(calls)

  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
