import { Abi, encodeFunctionData } from 'viem'
import { frames } from '../frames'
import { transaction } from 'frames.js/core'
import { PublicLockV14 } from '@unlock-protocol/contracts'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'

const abi = PublicLockV14.abi

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error('Invalid frame message')
  }

  const userAddress = ctx.message.connectedAddress!
  const network = Number(ctx.state.lock!.network)
  const lockAddress = ctx.state.lock!.address

  async function getKeyPrice() {
    const web3Service = new Web3Service(networks)
    const mydata = '0x'
    let price = await web3Service.purchasePriceFor({
      lockAddress,
      userAddress: userAddress,
      network,
      data: mydata,
      referrer: userAddress,
    })
    price = price.toString()
    return price
  }

  const keyPrice = await getKeyPrice()

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
