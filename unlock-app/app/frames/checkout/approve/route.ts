import { Abi, encodeFunctionData, erc20Abi } from 'viem'
import { frames } from '../frames'
import { transaction } from 'frames.js/core'

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error('Invalid frame message')
  }

  const lock = ctx.state.lock!
  const { address: lockAddress, network, priceForUser } = lock

  const calldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [lockAddress as `0x${string}`, BigInt(priceForUser!)],
  })

  return transaction({
    chainId: `eip155:${network}`,
    method: 'eth_sendTransaction',
    params: {
      abi: erc20Abi as Abi,
      to: ctx.state.lock?.tokenAddress as `0x${string}`,
      data: calldata,
      value: '0x0',
    },
  })
})
