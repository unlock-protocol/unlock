/**
 * Migrating 50% of Unlock DAO's existing UDT/WETH Liquidity Position
 * from Uniswap v2 pool to the Uniswap v3 pool
 */
const { ethers } = require('hardhat')
const { getTokenInfo } = require('../../helpers/uniswap')

// const daoAddress = '0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591'
const timelockAddress = '0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B'

// 50% only for starters
const percentageToMigrate = 50
const multisigAddress = '0xc3F2bcBE6fB42faC83dd8a42893C6c0B3809e070'
const udtWethV2poolAddress = '0x9cA8AEf2372c705d6848fddA3C1267a7F51267C1'

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
  const proposalName = `Migrating 50% of UDT/WETH Liquidity Position from Uniswap v2 pool


### Goal of the proposal

This proposal aims at moving 50% of the liquidity tokens owned by the DAO in [Uniswap V2 UDT/WETH pool](https://etherscan.io/address/${
    poolV2.address
  }) to a [multisig](https://etherscan.io/address/${multisigAddress}) owned by trustees . This transfer is a necessary step towards the end goal: migrate the current V2 liquidty position to the UDT/WETH Uniswap v3 pool (without risking a sandwich attack during the migration).


### Current situation of the ${symbol0}/${symbol1} V2 pool 

Address: ${poolV2.address}

#### DAO's liquidity tokens in V2 pool

- total : ${liquidity.toString()}
- **to transfer:${amountToTransfer.toString()}**

For reference, the total DAO's liquidity in V2 pool is ${ethers.formatEther(
    lp0
  )} ${symbol0} and ${ethers.formatEther(lp1)} ${symbol1}.


### About the proposal

The proposal contains a single call to the v2 pool \`transfer\` function that will transfer half of that liquidity tokens to the multisig - \`transfer(${multisigAddress},${amountToTransfer.toString()})\`.

Once approved and executed, the tokens will be transferred. The 5 signers of the multisig will take care of migrating the v2 position to the v3 pool.

Thank you!
The Unlock Team`

  console.log(proposalName)
  console.log(calls)

  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
