import { frames } from '../frames'
import { transaction } from 'frames.js/core'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error('Invalid frame message')
  }

  const userAddress = ctx.message.address!
  const { address: lockAddress } = ctx.state.lock!
  const network = Number(ctx.state.lock!.network)

  const web3Service = new Web3Service(networks)

  const calldata = await web3Service.purchaseKey({
    lockAddress,
    network,
    params: {
      lockAddress,
      owner: userAddress,
    },
  })

  return transaction({
    chainId: `eip155:${network}`,
    method: 'eth_sendTransaction',
    params: calldata[calldata.length - 1],
  })
})
