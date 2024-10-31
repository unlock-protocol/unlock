import { Abi, encodeFunctionData } from 'viem'
import { frames } from '../frames'
import { transaction } from 'frames.js/core'
import { erc20Abi, getKeyPrice } from '../components/utils'

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error('Invalid frame message')
  }

  const userAddress = ctx.message.address!
  const network = Number(ctx.state.lock!.network)
  const lockAddress = ctx.state.lock!.address

  const keyPrice = await getKeyPrice({
    lockAddress,
    network,
    userAddress,
  })

  const calldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [lockAddress, keyPrice],
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
