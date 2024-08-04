import { Abi, encodeFunctionData } from 'viem'
import { frames } from '../frames'
import { transaction } from 'frames.js/core'
import { PublicLockV14 } from '@unlock-protocol/contracts'

const abi = PublicLockV14.abi
const chain = 11155111
const lockAddress = '0x9B03Ab44C945114CFDc0A111E07f7A11600252eF'
const value = 1e5

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error('Invalid frame message')
  }

  const userAddress = ctx.message.connectedAddress

  // PARAMS
  // function purchase(
  //   uint256[] calldata _values,
  //   address[] calldata _recipients,
  //   address[] calldata _referrers,
  //   address[] calldata _keyManagers,
  //   bytes[] calldata _data
  // ) external payable returns (uint256[] memory tokenIds);

  const calldata = encodeFunctionData({
    abi,
    functionName: 'purchase',
    args: [[value], [userAddress], [userAddress], [userAddress], ['0x']],
  })

  return transaction({
    chainId: `eip155:${chain}`,
    method: 'eth_sendTransaction',
    params: {
      abi: abi as Abi,
      to: lockAddress,
      data: calldata,
      // value: value.toString(),
    },
  })
})
