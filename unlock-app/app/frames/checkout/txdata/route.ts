import { Abi, encodeFunctionData } from 'viem'
import { frames } from '../frames'
import { transaction } from 'frames.js/core'
import { PublicLockV14 } from '@unlock-protocol/contracts'
import { getKeyPrice } from '../components/utils'

const abi = PublicLockV14.abi

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
    abi,
    functionName: 'purchase',
    args: [[keyPrice], [userAddress], [userAddress], [userAddress], ['0x']],
  })

  return transaction({
    chainId: `eip155:${network}`,
    method: 'eth_sendTransaction',
    params: {
      abi: abi as Abi,
      to: lockAddress as `0x${string}`,
      data: calldata,
      value: keyPrice.toString(),
    },
  })
})
